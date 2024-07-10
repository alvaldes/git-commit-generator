import { execSync } from "child_process";

// ArgsTypes
// apiKey?: string; // Ex: --apiKey MY_API_KEY
// language?: string; // Ex: --language spanish
// template?: string; // Ex: --template "Modified {GIT_BRANCH} | {COMMIT_MESSAGE}"
// "commit-type"?: string; // Ex: --commit-type feat
// list?: string; // Ex: --list
// force?: string; // Ex: --force

const getArgs = () => {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const key = arg.replace(/^--/, "");
    const nextArg = args[i + 1];
    if (/^--/.test(nextArg) || nextArg === undefined) {
      result[key] = true;
    } else {
      result[key] = nextArg;
      i++;
    }
  }

  return result;
};

const checkGitRepository = () => {
  try {
    const output = execSync("git rev-parse --is-inside-work-tree", {
      encoding: "utf-8",
    });
    return output.trim() === "true";
  } catch (err) {
    return false;
  }
};

export { getArgs, checkGitRepository };
