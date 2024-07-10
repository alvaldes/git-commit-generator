# gti-commit-generator: A tool to generate commit messages based on staged changes using AI

💻 Tired of writing boring commit messages? Let gti-commit-generator help!

This package uses the power of Google's gemini-1.5-flash model to understand your code changes and generate meaningful commit messages for you. Whether you're working on a solo project or collaborating with a team, gti-commit-generator makes it easy to keep your commit history organized and professional.

## How it Works

1. Install gti-commit-generator using `npm install -g gcg`
2. Generate a Google API key [here](https://makersuite.google.com/app/apikey)
3. Set your `GOOGLE_GENERATIVE_AI_API_KEY` environment variable to your API key
4. Make your code changes and stage them with `git add .`
5. Type `gcg` in your terminal
6. gti-commit-generator will analyze your changes and generate a commit message
7. Approve the commit message and gti-commit-generator will create the commit for you ✅

## Options

- `--list`: Select from a list of 5 generated messages (or regenerate the list)
- `--force`: Automatically create a commit without being prompted to select a message (can't be used with `--list`)
- `--apiKey`: Your OpenAI API key. It is not recommended to pass `apiKey` here, it is better to use `env` variable
- `--template`: Specify a custom commit message template. e.g. `--template "Modified {GIT_BRANCH} | {COMMIT_MESSAGE}"`
- `--language`: Specify the language to use for the commit message (default: `english`). e.g. `--language spanish`
- `--commit-type`: Specify the type of commit to generate. This will be used as the type in the commit message e.g. `--commit-type feat`

## Contributing

You are welcome to contribute to gti-commit-generator! To contribute, follow these steps:

1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`.
3. Make your changes and ensure they work as expected.
4. Commit your changes: `git commit -am 'Add some feature'`.
5. Push to the branch: `git push origin feature/your-feature-name`.
6. Submit a pull request detailing the changes and why they're beneficial.
7. Await feedback or approval. Thanks for contributing!

## Project Origins

gti-commit-generator is a fork of [ai-commit](https://github.com/insulineru/ai-commit), originally developed by [insulineru](https://github.com/insulineru). We have built upon their work to create a tool that leverages Google's gemini-1.5-flash model to generate commit messages based on staged changes in your Git repository.

## License

gti-commit-generator is licensed under the MIT License.
