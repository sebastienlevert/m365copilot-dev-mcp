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

**Recommended:** Use `npx` with `@latest` to always get the latest version without global installation:

```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk -h
```

Alternatively, install globally:

```bash
npm install -g @microsoft/m365agentstoolkit-cli
atk -h
```

**Best Practice:** Always use `npx -p @microsoft/m365agentstoolkit-cli@latest` in all your commands to ensure you're using the latest version of ATK CLI.

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
npx -p @microsoft/m365agentstoolkit-cli@latest atk new -n daTypeSpec -c declarative-agent -with-plugin type-spec -i false
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

### Examples

```bash
# Provision to dev environment
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev

# Provision to local environment (uses m365agents.local.yml)
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env local

# Non-interactive mode
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev -i false
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

### Examples

```bash
# Deploy to dev environment
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev

# Deploy to local environment (uses m365agents.local.yml)
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env local

# Non-interactive mode
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev -i false
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

### Examples

```bash
# Package for dev environment
npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev

# Package for production with custom output folder
npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env prod --output-folder ./dist

# Non-interactive mode
npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev -i false
```

## atk publish

Run the publish stage in `m365agents.yml`.

### Parameters

| Parameter         | Required | Description                                                |
| :---------------- | :------- | :--------------------------------------------------------- |
| `--env`           | No       | Environment name.                                          |
| `--manifest-file` | No       | App manifest file path. Default: `./appPackage/manifest.json`. |
| `--folder -f`     | No       | Project root folder. Default: `./`.                        |

### Examples

```bash
# Publish to production
npx -p @microsoft/m365agentstoolkit-cli@latest atk publish --env prod

# Non-interactive mode
npx -p @microsoft/m365agentstoolkit-cli@latest atk publish --env prod -i false
```

## atk share

Share your agent with specific users/groups or with your entire tenant.

**⚠️ IMPORTANT Prerequisites:**
1. You must provision the agent first
2. The agent must have `AGENT_SCOPE=shared` in the environment file (`env/.env.{environment}`)
3. Agents without AGENT_SCOPE=shared should not be shared

### Parameters

| Parameter    | Required | Description                                                                           |
| :----------- | :------- | :------------------------------------------------------------------------------------ |
| `--scope`    | Yes      | Share scope. Options: `users` (specific users/groups) or `tenant` (entire tenant).   |
| `--email`    | Conditional | CSV list of user/group emails. Required when `--scope users`.                      |
| `--env`      | No       | Environment name. Default: `dev`.                                                     |
| `--folder -f`| No       | Project root folder. Default: `./`.                                                   |
| `-i`         | No       | Interactive mode. Set to `false` for non-interactive. Default: `true`.                |

### Prerequisites

Before sharing, ensure these conditions are met:

1. **Agent is provisioned:** The environment file must exist: `env/.env.{environment}` (e.g., `env/.env.dev`)
2. **M365_TITLE_ID exists:** The environment file must contain `M365_TITLE_ID` (generated during provision)
3. **⚠️ AGENT_SCOPE is set to shared:** The environment file must contain `AGENT_SCOPE=shared`

**If AGENT_SCOPE is not set to shared, DO NOT share the agent.** Personal-scoped agents should not be shared.

If not provisioned, run:
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev
```

**To set AGENT_SCOPE=shared:**
Add this line to your `env/.env.{environment}` file:
```
AGENT_SCOPE=shared
```

### Examples

**Share with entire tenant (using npx):**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false
```

**Share with specific users:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope users --email 'user1@contoso.com,user2@contoso.com' --env dev -i false
```

**Share with users and groups:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope users --email 'user@contoso.com,group@contoso.com' --env dev -i false
```

**Share to local environment:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env local -i false
```

### Common Issues

**Error: Environment not provisioned**
- Ensure you've run `atk provision --env {environment}` first
- Check that `env/.env.{environment}` exists and contains `M365_TITLE_ID`

**Error: UnknownOptionError**
- Make sure to use `--scope` (not `--with`)
- For users scope, use `--email` parameter
- Always set `-i false` for non-interactive mode

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

Complete deployment sequence using `npx @latest`:

```bash
# 1. Validate
npx -p @microsoft/m365agentstoolkit-cli@latest atk validate --manifest-file ./appPackage/manifest.json

# 2. Provision (first time only)
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev

# 3. Deploy (if your agent has backend code)
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev

# 4. Package
npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev

# 5. Share with users or tenant
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false

# 6. Publish (optional - for app store submission)
npx -p @microsoft/m365agentstoolkit-cli@latest atk publish --env dev
```

**Note:** Always use `npx -p @microsoft/m365agentstoolkit-cli@latest` to ensure you're using the latest version.

## Common Issues

### Command Not Found

**Issue:** `atk: command not found`

**Solution:**
```bash
npm install -g @microsoft/m365agentstoolkit-cli
# Or use npx @latest (recommended):
npx -p @microsoft/m365agentstoolkit-cli@latest atk --version
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
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev  # Provision first
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev     # Then deploy
```

## Additional Resources

- [Official Documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)
- [GitHub Repository](https://github.com/OfficeDev/microsoft-365-agents-toolkit)
- [npm Package](https://www.npmjs.com/package/@microsoft/m365agentstoolkit-cli)
- [TypeSpec Documentation](https://typespec.io/)
