# Microsoft 365 Agents Toolkit Command Line Interface

[Official Documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)

Microsoft 365 Agents Toolkit command line interface (Agents Toolkit CLI) is a text-based command line interface that can help scaffold, validate, and deploy applications for Microsoft 365 from the terminal or a CI/CD process.

Whether you prefer keyboard-centric developer operations, or you are automating your CI/CD pipeline, Agents Toolkit CLI offers the same features as the IDE extensions. It provides the following features to facilitate the development of agents or apps for Microsoft 365 Copilot, Microsoft Teams, and Microsoft 365:

- **Collaboration**: Invite other developers to collaborate on your Agents Toolkit project to debug and deploy.
- **Agent/Application Creation**: Generate a new agent or app using available templates and samples.
- **Agent/Application Preview**: Upload and preview your agent or app in Teams, Outlook, and the Microsoft 365 app.
- **Resource Provisioning and Deployment**: Provision necessary cloud resources and deploy your application to Azure.
- **Validation, Packaging, and Publishing**: Validate, package, and publish your agent or application using CLI commands.
- **Environment Management**: Manage multiple environments, Microsoft Entra apps, and Teams app registration.

## Get Started

Install `@microsoft/m365agentstoolkit-cli` from `npm` and run `atk -h` to check all available commands:

```bash
npm install -g @microsoft/m365agentstoolkit-cli
atk -h
```

## Supported Commands

| Command                 | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `atk doctor`            | Prerequisite checker for building Microsoft 365 Apps.                       |
| `atk new`               | Create a new Microsoft 365 App.                                             |
| `atk add`               | Add feature to your Microsoft 365 App.                                      |
| `atk auth`              | Manage Microsoft 365 and Azure accounts.                                    |
| `atk entra-app`         | Manage the Microsoft Entra app in the current application.                  |
| `atk env`               | Manage environments.                                                        |
| `atk help`              | Show Microsoft 365 Agents Toolkit CLI help.                                 |
| `atk install`           | Upload a given application package across Microsoft 365.                    |
| `atk launchinfo`        | Get launch information of an acquired Microsoft 365 App.                    |
| `atk list`              | List available Microsoft 365 App templates and samples.                     |
| `atk provision`         | Run the provision stage in `m365agents.yml` or `m365agents.local.yml`.     |
| `atk deploy`            | Run the deploy stage in `m365agents.yml` or `m365agents.local.yml`.        |
| `atk package`           | Build your Microsoft 365 App into a package for publishing.                 |
| `atk validate`          | Validate the Microsoft 365 App using manifest schema or validation rules.   |
| `atk publish`           | Run the publish stage in `m365agents.yml`.                                  |
| `atk preview`           | Preview the current application.                                            |
| `atk update`            | Update the Microsoft 365 App manifest to Developer Portal.                  |
| `atk upgrade`           | Upgrade the project to work with the latest version of Agents Toolkit.     |
| `atk collaborator`      | Manage permissions for Microsoft 365 App and Microsoft Entra application.   |
| `atk uninstall`         | Clean up resources associated with Manifest ID, Title ID, or environment.   |

## Global Options

| Options            | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `--version -v`     | Display Microsoft 365 Agents Toolkit CLI version.               |
| `--help -h`        | Show Microsoft 365 Agents Toolkit CLI help.                     |
| `--interactive -i` | Run the command in interactive mode. The default value is true. |
| `--debug`          | Print debug information. The default value is false.            |
| `--verbose`        | Print diagnostic information. The default value is false.       |
| `--telemetry`      | Enables telemetry. The default value is true.                   |

## atk new

Create a new Microsoft 365 App. Operates in interactive mode by default.

### Parameters

| Parameter                   | Required | Description                                                                                           |
| :-------------------------- | :------- | :---------------------------------------------------------------------------------------------------- |
| `--app-name -n`             | Yes      | Name of your application.                                                                             |
| `--capability -c`           | Yes      | App feature. Options: `declarative-agent`, `basic-custom-engine-agent`, `weather-agent`.             |
| `--programming-language -l` | No       | Programming language. Options: `javascript`, `typescript`, `csharp`. Default: `javascript`.           |
| `--folder -f`               | No       | Directory where the project folder is created. Default: `./`.                                         |
| `-with-plugin`              | No       | Plugin to include. Options: `type-spec` for TypeSpec-based declarative agents.                       |
| `--interactive -i`          | No       | Interactive mode. Default: `true`. Set to `false` for non-interactive mode.                          |

### TypeSpec Declarative Agent Example

Create a declarative agent with TypeSpec plugin:

```bash
npx --package=@microsoft/m365agentstoolkit-cli atk new -n daTypeSpec -c declarative-agent -with-plugin type-spec -i false
```

This creates a TypeSpec-based declarative agent with:
- Type-safe agent and API definitions
- Full IntelliSense and IDE support
- Automatic validation of agent configurations
- Clear contracts and documentation

### Other Examples

Create a weather agent:
```bash
atk new -c weather-agent -l typescript -n myagent -i false
```

Create a timer-triggered notification bot:
```bash
atk new -c notification -t timer-functions -l typescript -n myapp -i false
```

## atk provision

Run the provision stage in `m365agents.yml`.

### Parameters

| Parameter           | Required | Description                                                |
| :------------------ | :------- | :--------------------------------------------------------- |
| `--env`             | No       | Environment name. Default: `dev`.                          |
| `--folder -f`       | No       | Project root folder. Default: `./`.                        |
| `--ignore-env-file` | No       | Skip loading .env file when --env isn't specified.         |

### Example

```bash
atk provision --env dev
atk provision --env local  # Uses m365agents.local.yml
```

## atk deploy

Run the deploy stage in `m365agents.yml`.

### Parameters

| Parameter               | Required | Description                                    |
| :---------------------- | :------- | :--------------------------------------------- |
| `--env`                 | Yes      | Environment name.                              |
| `--folder -f`           | No       | Project root folder. Default: `./`.            |
| `--config-file-path -c` | No       | Path of the configuration yaml file.           |
| `--ignore-env-file`     | No       | Skip loading .env file when --env isn't specified. |

### Example

```bash
atk deploy --env dev
atk deploy --env local  # Uses m365agents.local.yml
```

## atk package

Build your Microsoft 365 App into a package for publishing.

### Parameters

| Parameter               | Required | Description                                                                         |
| :---------------------- | :------- | :---------------------------------------------------------------------------------- |
| `--env`                 | No       | Environment name.                                                                   |
| `--manifest-file`       | No       | App manifest file path. Default: `./appPackage/manifest.json`.                      |
| `--output-folder`       | No       | Output folder. Default: `./appPackage/build`.                                       |
| `--output-package-file` | No       | Output zip path. Default: `./appPackage/build/appPackage.${env}.zip`.              |
| `--folder -f`           | No       | Project root folder. Default: `./`.                                                 |

### Example

```bash
atk package --env dev
atk package --env prod --output-folder ./dist
```

## atk publish

Run the publish stage in `m365agents.yml`.

### Parameters

| Parameter         | Required | Description                                                |
| :---------------- | :------- | :--------------------------------------------------------- |
| `--env`           | No       | Environment name.                                          |
| `--manifest-file` | No       | App manifest file path. Default: `./appPackage/manifest.json`. |
| `--folder -f`     | No       | Project root folder. Default: `./`.                        |

### Example

```bash
atk publish --env prod
```

## atk validate

Validate the Microsoft 365 App using manifest schema or validation rules.

### Parameters

| Parameter               | Required | Description                                                                 |
| :---------------------- | :------- | :-------------------------------------------------------------------------- |
| `--manifest-file`       | No       | Manifest file path. Default: `./appPackage/manifest.json`.                  |
| `--package-file`        | No       | Zipped package path.                                                        |
| `--validate-method -m`  | No       | Validation method. Options: `validation-rules`, `test-cases`.               |
| `--env`                 | No       | Environment name.                                                           |
| `--folder -f`           | No       | Project root folder. Default: `./`.                                         |

### Example

```bash
atk validate --manifest-file ./appPackage/manifest.json
atk validate --package-file ./appPackage.zip
```

## atk doctor

Check prerequisites needed to build Microsoft 365 Apps.

### Example

```bash
atk doctor
```

## atk env

Manage application environments.

### Commands

| Command         | Description                                      |
| :-------------- | :----------------------------------------------- |
| `atk env add`   | Add new environment by copying from existing.    |
| `atk env list`  | List all available environments.                 |
| `atk env reset` | Reset environment file.                          |

### Example

```bash
atk env add staging --env dev
atk env list
```

## atk preview

Preview the application during development.

### Parameters

| Parameter          | Required | Description                                                                      |
| :----------------- | :------- | :------------------------------------------------------------------------------- |
| `--m365-host -m`   | No       | Platform to preview. Options: `teams`, `outlook`, `office`. Default: `teams`.    |
| `--env`            | No       | Environment. Default: `local`.                                                   |
| `--browser -b`     | No       | Browser. Options: `chrome`, `edge`, `default`. Default: `default`.               |
| `--run-command -c` | No       | Command to start service. Auto-detects from project type if undefined.          |
| `--open-only -o`   | No       | Open web client without launching local service. Default: `false`.               |
| `--desktop -d`     | No       | Open Teams desktop client instead of web client. Default: `false`.               |
| `--folder -f`      | No       | Project root folder. Default: `./`.                                              |

### Example

```bash
atk preview --env local --browser chrome
atk preview --env remote --browser edge
```

## atk install

Upload application package across Microsoft 365.

### Parameters

| Parameter     | Description                                   |
| :------------ | :-------------------------------------------- |
| `--file-path` | Path to app manifest zip package.             |
| `--xml-path`  | Path to XML manifest file.                    |
| `--scope`     | App scope. Options: `Personal`, `Shared`.     |

### Example

```bash
atk install --file-path appPackage.zip
atk install --file-path appPackage.zip --scope Shared
```

## atk list

List available Microsoft 365 app templates and samples.

### Commands

| Command              | Description                      |
| :------------------- | :------------------------------- |
| `atk list samples`   | List available app samples.      |
| `atk list templates` | List available app templates.    |

### Example

```bash
atk list templates
atk list samples
```

## atk auth

Manage Microsoft 365 and Azure accounts.

### Commands

| Command                     | Description                                      |
| :-------------------------- | :----------------------------------------------- |
| `atk auth list`             | Display all connected accounts.                  |
| `atk auth login`            | Log in to Microsoft 365 or Azure account.        |
| `atk auth logout <service>` | Log out of Microsoft 365 or Azure account.       |

### Example

```bash
atk auth login
atk auth list
```

## atk collaborator

Manage permissions for Microsoft 365 App and Microsoft Entra application.

### Commands

| Command                   | Description                              |
| :------------------------ | :--------------------------------------- |
| `atk collaborator status` | Display current permission status.       |
| `atk collaborator grant`  | Grant permission for another account.    |

### Example

```bash
atk collaborator grant --email other@email.com --env dev
atk collaborator status --env dev
```

## atk uninstall

Clean up resources associated with Manifest ID, Title ID, or environment.

### Parameters

| Parameter       | Description                                        |
| :-------------- | :------------------------------------------------- |
| `--mode`        | Cleanup mode.                                      |
| `--title-id`    | Title ID of installed Microsoft 365 app.           |
| `--manifest-id` | Manifest ID of installed Microsoft 365 app.        |

### Example

```bash
atk uninstall --mode title-id --title-id U_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
atk uninstall --mode manifest-id --manifest-id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Best Practices

### TypeSpec Declarative Agents

For building type-safe declarative agents:

1. **Always use the TypeSpec plugin:**
   ```bash
   atk new -n myAgent -c declarative-agent -with-plugin type-spec -i false
   ```

2. **Use TypeScript language** for full IDE support and type safety.

3. **Non-interactive mode** for automation and CI/CD:
   - Always use `-i false` flag
   - Provide all required parameters explicitly
   - Use in scripts and automation pipelines

### Environment Management

1. **Separate environments** for different deployment stages:
   - `local` - Local development
   - `dev` - Development environment
   - `staging` - Pre-production testing
   - `prod` - Production environment

2. **Environment-specific configurations:**
   - Use `m365agents.{env}.yml` for each environment
   - Keep `.env.{env}` files in `.gitignore`
   - Use Azure Key Vault for production secrets

### Deployment Workflow

Complete deployment sequence:

```bash
# 1. Validate
atk validate --manifest-file ./appPackage/manifest.json

# 2. Provision (first time only)
atk provision --env dev

# 3. Deploy
atk deploy --env dev

# 4. Package
atk package --env dev

# 5. Publish
atk publish --env dev
```

## Common Issues

### Command Not Found

**Issue:** `atk: command not found`

**Solution:**
```bash
npm install -g @microsoft/m365agentstoolkit-cli
# Or use npx:
npx --package=@microsoft/m365agentstoolkit-cli atk --version
```

### Authentication Required

**Issue:** Not logged in to Azure or Microsoft 365

**Solution:**
```bash
az login  # For Azure
atk auth login  # For Microsoft 365
```

### Environment Not Provisioned

**Issue:** `.env.{environment}` file not found

**Solution:**
```bash
atk provision --env dev  # Provision first
atk deploy --env dev     # Then deploy
```

## Additional Resources

- [Official Documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)
- [GitHub Repository](https://github.com/OfficeDev/microsoft-365-agents-toolkit)
- [npm Package](https://www.npmjs.com/package/@microsoft/m365agentstoolkit-cli)
- [TypeSpec Documentation](https://typespec.io/)
