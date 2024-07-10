#!/usr/bin/env node

"use strict";
import { execSync } from "child_process";
import { google } from "@ai-sdk/google";
import inquirer from "inquirer";
import { checkGitRepository } from "./helpers.js";
import { filterApi } from "./filterApi.js";
import { args } from "./config.js";
import { streamText } from "ai";

const REGENERATE_MSG = "♻️ Regenerate Commit Messages";

const apiKey = args.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const language = args.language || process.env.AI_COMMIT_LANGUAGE || "english";

if (!apiKey) {
  console.error(
    "Please set the GOOGLE_GENERATIVE_AI_API_KEY environment variable."
  );
  process.exit(1);
}

let template = args.template || process.env.AI_COMMIT_COMMIT_TEMPLATE;

const commitType = args["commit-type"];

const processTemplate = ({ template, commitMessage }) => {
  if (!template.includes("COMMIT_MESSAGE")) {
    console.log(`Warning: template doesn't include {COMMIT_MESSAGE}`);

    return commitMessage;
  }

  let finalCommitMessage = template.replaceAll(
    "{COMMIT_MESSAGE}",
    commitMessage
  );

  if (finalCommitMessage.includes("GIT_BRANCH")) {
    const currentBranch = execSync("git branch --show-current")
      .toString()
      .replace(/\n/g, "");

    console.log("Using currentBranch: ", currentBranch);

    finalCommitMessage = finalCommitMessage.replaceAll(
      "{GIT_BRANCH}",
      currentBranch
    );
  }

  return finalCommitMessage;
};

const makeCommit = (input) => {
  console.log("Committing Message... 🚀 ");
  execSync(`git commit -F -`, { input: input[0] });
  console.log("Commit Successful! 🎉");
};

/**
 * send prompt to ai.
 */
const sendMessage = async (input) => {
  console.log("prompting google-ai...");
  const result = await streamText({
    model: google("models/gemini-1.5-flash-latest"),
    prompt: input,
  });
  console.log("prompting ai done!");
  return result;
};

const getPromptForSingleCommit = (diff) => {
  return (
    "I want you to act as the author of a commit message in git." +
    `I'll enter a git diff, and your job is to convert it into a useful commit message in ${language} language` +
    (commitType ? ` with commit type '${commitType}'. ` : ". ") +
    "Do not preface the commit with anything, use the present tense, return the full sentence, and use the conventional commits specification (<type in lowercase>: <subject>): " +
    diff
  );
  //for less smart models, give simpler instruction.
  //   return (
  //     "Summarize this git diff into a useful, 10 words commit message" +
  //     (commitType ? ` with commit type '${commitType}.'` : "") +
  //     ": " +
  //     diff
  //   );
};

const generateSingleCommit = async (diff) => {
  const prompt = getPromptForSingleCommit(diff);

  if (!(await filterApi({ prompt }))) process.exit(1);

  let resp = await sendMessage(prompt);
  let text = "";
  for await (const part of resp.textStream) {
    text += part; // vamos guardando el resultado en el array
  }
  let finalCommitMessage = text.split(";").map((msg) => msg.trim());

  if (args.template) {
    finalCommitMessage = processTemplate({
      template: args.template,
      commitMessage: finalCommitMessage,
    });

    console.log(
      `Proposed Commit With Template:\n------------------------------\n${finalCommitMessage}\n------------------------------`
    );
  } else {
    console.log(
      `Proposed Commit:\n------------------------------\n${finalCommitMessage}\n------------------------------`
    );
  }

  if (args.force) {
    makeCommit(finalCommitMessage);
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "continue",
      message: "Do you want to continue?",
      default: true,
    },
  ]);

  if (!answer.continue) {
    console.log("Commit aborted by user 🙅‍♂️");
    process.exit(1);
  }

  makeCommit(finalCommitMessage);
};

const generateListCommits = async (diff, numOptions = 5) => {
  const prompt =
    "I want you to act as the author of a commit message in git." +
    `I'll enter a git diff, and your job is to convert it into a useful commit message in ${language} language` +
    (commitType ? ` with commit type '${commitType}.', ` : ", ") +
    `and make ${numOptions} options that are separated by ";".` +
    "For each option, use the present tense, return the full sentence, and use the conventional commits specification (<type in lowercase>: <subject>):" +
    diff;

  if (
    !(await filterApi({
      prompt,
    }))
  )
    process.exit(1);

  const result = await sendMessage(prompt);
  let text = "";

  for await (const part of result.textStream) {
    text += part; // vamos guardando el resultado en el array
  }
  let msgs = text.split(";").map((msg) => msg.trim());

  if (args.template) {
    msgs = msgs.map((msg) =>
      processTemplate({
        template: args.template,
        commitMessage: msg,
      })
    );
  }

  // add regenerate option
  msgs.push(REGENERATE_MSG);

  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "commit",
      message: "Select a commit message",
      choices: msgs,
    },
  ]);

  if (answer.commit === REGENERATE_MSG) {
    await generateListCommits(diff);
    return;
  }

  makeCommit(answer.commit);
};

async function generateAICommit() {
  const isGitRepository = checkGitRepository();

  if (!isGitRepository) {
    console.error("This is not a git repository 🙅‍♂️");
    process.exit(1);
  }

  const diff = execSync("git diff --staged").toString();

  // Handle empty diff
  if (!diff) {
    console.log("No changes to commit 🙅");
    console.log(
      "May be you forgot to add the files? Try git add . and then run this script again."
    );
    process.exit(1);
  }

  args.list
    ? await generateListCommits(diff)
    : await generateSingleCommit(diff);
}

await generateAICommit();
