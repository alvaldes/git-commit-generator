import inquirer from "inquirer";

const MAX_TOKENS = 4000; // Establece el máximo de tokens permitidos para Google AI.

async function filterApi({ prompt }) {
  const numTokens = getNumTokens(prompt); // Todo: Calcula la longitud en tokens del prompt codificado según Google AI.

  if (numTokens > MAX_TOKENS) {
    console.log(
      `The commit diff is too large for the Google AI API. Max ${MAX_TOKENS} tokens.`
    );
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "confirm",
        message: `Do you want to continue with ${MAX_TOKENS} tokens? (yes/no)`,
        validate: function (input) {
          const normalizedInput = input.trim().toLowerCase();
          if (
            normalizedInput === "yes" ||
            normalizedInput === "y" ||
            normalizedInput === "no" ||
            normalizedInput === "n"
          ) {
            return true;
          } else {
            return "Please enter 'yes' or 'no'.";
          }
        },
      },
    ]);

    if (answer.confirm.toLowerCase() !== "yes") return false; // Si el usuario no responde 'yes', devuelve falso.
  }

  return true; // Si pasa todas las verificaciones, devuelve verdadero.
}

function getNumTokens(prompt) {
  // Implementa una lógica para calcular la cantidad de tokens del prompt.
  // Esto puede variar según cómo se estructura el prompt y cómo lo analiza el modelo.
  // Puedes usar métodos de manipulación de cadenas o técnicas de conteo de tokens aquí.
  return prompt.split(" ").length; // Ejemplo simple: cuenta los tokens dividiendo por espacios.
}

export { filterApi };
