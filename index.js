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

/**
 * Processes the commit message template.
 * @param {Object} options - Options for the template.
 * @param {string} options.template - The template to use.
 * @param {string} options.commitMessage - The commit message.
 * @returns {string} - The processed commit message.
 */
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

/**
 * Creates a commit with the given message.
 * @param {string} input - The commit message.
 */
const makeCommit = (input) => {
  console.log("Committing Message... 🚀 ");
  execSync(`git commit -F -`, { input: input[0] });
  console.log("Commit Successful! 🎉");
};

/**
 * Sends the prompt to the AI model.
 * @param {string} input - The input prompt.
 * @returns {Promise<string>} - The AI response.
 */
const sendMessage = async (input) => {
  console.log("Prompting Google AI...");
  const result = await streamText({
    model: google("models/gemini-1.5-flash-latest"),
    prompt: input,
  });
  console.log("Prompting AI done!");
  return result;
};

/**
 * Generates the prompt for a commit.
 * @param {string} diff - The git diff.
 * @param {number} [numOptions] - Number of options for list commits.
 * @returns {string} - The generated prompt.
 */
const generatePrompt = (diff, numOptions) => {
  const basePrompt =
    "I want you to act as the author of a commit message in git. " +
    `I'll enter a git diff, and your job is to convert it into a useful commit message in ${language} language` +
    (commitType ? ` with commit type '${commitType}'. ` : ". ");

  if (numOptions) {
    return (
      basePrompt +
      (commitType ? ` with commit type '${commitType}.', ` : ", ") +
      `and make ${numOptions} options that are separated by ';'. ` +
      "For each option, use the present tense, return the full sentence, and use the conventional commits specification (<type in lowercase>: <subject>): " +
      diff
    );
  }

  return (
    basePrompt +
    "Do not preface the commit with anything, use the present tense, return the full sentence, and use the conventional commits specification (<type in lowercase>: <subject>): " +
    diff
  );
};

/**
 * Generates a single commit message.
 * @param {string} diff - The git diff.
 */
const generateSingleCommit = async (diff) => {
  const prompt = generatePrompt(diff);
  if (!(await filterApi({ prompt }))) process.exit(1);

  let resp = await sendMessage(prompt);
  let text = "";
  for await (const part of resp.textStream) {
    text += part;
  }
  let finalCommitMessage = text.split(";").map((msg) => msg.trim());

  if (template) {
    finalCommitMessage = processTemplate({
      template,
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

/**
 * Generates multiple commit message options.
 * @param {string} diff - The git diff.
 * @param {number} [numOptions=5] - Number of commit message options.
 */
const generateListCommits = async (diff, numOptions = 5) => {
  const prompt = generatePrompt(diff, numOptions);

  if (!(await filterApi({ prompt }))) process.exit(1);

  const result = await sendMessage(prompt);
  let text = "";

  for await (const part of result.textStream) {
    text += part;
  }
  let msgs = text.split(";").map((msg) => msg.trim());

  if (template) {
    msgs = msgs.map((msg) =>
      processTemplate({
        template,
        commitMessage: msg,
      })
    );
  }

  // Add regenerate option
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
    await generateListCommits(diff, numOptions);
    return;
  }

  makeCommit(answer.commit);
};

/**
 * Main function to generate AI commit messages.
 */
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
      "Maybe you forgot to add the files? Try git add . and then run this script again."
    );
    process.exit(1);
  }

  args.list
    ? await generateListCommits(diff)
    : await generateSingleCommit(diff);
}

await generateAICommit();
