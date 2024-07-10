import inquirer from "inquirer";

const MAX_TOKENS = 1048576; // Maximum number of tokens allowed for Google AI.

/**
 * Filters the prompt based on the number of tokens.
 * @param {Object} options - Options for the API.
 * @param {string} options.prompt - The prompt to be evaluated.
 * @returns {boolean} - True if the prompt passes the verification, false otherwise.
 */
async function filterApi({ prompt }) {
  const numTokens = calculateNumTokens(prompt);

  if (numTokens > MAX_TOKENS) {
    console.log(
      `The commit diff is too large for the Google AI API. Max ${MAX_TOKENS} tokens.`
    );

    const answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "continue",
        message: `Do you want to continue with ${MAX_TOKENS} tokens?`,
        default: true,
      },
    ]);

    return answer.continue; // Returns the user's response.
  }

  return true; // The prompt is within the allowed token limit.
}

/**
 * Calculates the number of tokens in a prompt.
 * @param {string} prompt - The prompt to be evaluated.
 * @returns {number} - The number of tokens.
 */
function calculateNumTokens(prompt) {
  // TODO: Implement logic to calculate the number of tokens in the prompt.
  // Currently, counts the words separated by spaces.
  return prompt.split(" ").length;
}

export { filterApi };
