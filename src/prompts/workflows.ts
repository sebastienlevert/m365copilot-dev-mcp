/**
 * Workflow prompts
 * Guided multi-step workflows for common ATK operations
 */

export interface PromptDefinition {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: {
    type: 'text';
    text: string;
  };
}

/**
 * Create Declarative Agent workflow
 */
export const createDeclarativeAgentPrompt: PromptDefinition = {
  name: 'create-declarative-agent',
  description: 'Create a new TypeSpec-based declarative agent project with guided setup and best practices',
  arguments: [
    {
      name: 'projectName',
      description: 'Name for the new declarative agent project',
      required: true
    },
    {
      name: 'targetDirectory',
      description: 'Directory where project should be created (optional)',
      required: false
    }
  ]
};

export function getCreateDeclarativeAgentPrompt(args: Record<string, string>): PromptMessage[] {
  const projectName = args.projectName || 'my-declarative-agent';
  const targetDirectory = args.targetDirectory || '.';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to create a new declarative agent project named "${projectName}"${targetDirectory !== '.' ? ` in directory "${targetDirectory}"` : ''}.`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll help you create a new TypeSpec-based declarative agent using the Microsoft 365 Agents Toolkit. This workflow will:

1. Check system prerequisites
2. Create the declarative agent project with TypeSpec
3. Validate the project structure
4. Provide next steps for customization and deployment

**Project Configuration:**
- Name: ${projectName}
- Template: declarative-agent
- Format: TypeSpec (type-safe, recommended)
- Location: ${targetDirectory}

**About Declarative Agents with TypeSpec:**
Declarative agents let you build sophisticated Microsoft 365 agents using:
- **TypeSpec definitions**: Type-safe agent and API configurations
- **Instructions**: Define agent behavior through natural language
- **No custom code**: Perfect for conversational scenarios
- **Knowledge integration**: Connect to your data sources
- **Built-in capabilities**: Conversation starters, web search, and more

**TypeSpec Benefits:**
- Full IntelliSense and IDE support
- Catch configuration errors at design time
- Clear contracts and documentation
- Automatic validation of agent configurations

Let me start by checking your system prerequisites with atk_doctor...

[After doctor check completes, I'll proceed with creating the project using atk_new, then automatically change to the new project directory, and validate it with atk_validate]

**⚠️ CRITICAL FOR CODING AGENTS - DO NOT EDIT GENERATED FILES:**
After project creation, NEVER edit these files:
- appPackage/manifest.json (auto-generated)
- appPackage/declarativeAgent.json (auto-generated)
- .generated/ folder (all files auto-generated)
- Manual edits will be lost during build

**Edit Only Source Files:**
- TypeSpec source files (src/*.tsp) - Agent instructions, capabilities, definitions
- Icons (appPackage/*.png)
- Environment files (.env)
- Build configuration (m365agents.yml)

**Next Steps After Creation:**
1. **IMPORTANT FOR VS CODE:** I will open the new workspace in VS Code and continue our conversation there
2. Review the TypeSpec source files (src/*.tsp) for your agent
3. Customize agent instructions, conversation starters, and capabilities in TypeSpec files
4. Build the project to regenerate manifest.json and declarativeAgent.json
5. Configure knowledge sources if needed
6. Test locally with preview tools
7. Deploy to Microsoft 365

Would you like me to proceed with the doctor check?`
      }
    }
  ];
}

/**
 * Deploy Agent Complete workflow
 */
export const deployAgentCompletePrompt: PromptDefinition = {
  name: 'deploy-agent-complete',
  description: 'Complete deployment workflow from validation to publishing',
  arguments: [
    {
      name: 'projectPath',
      description: 'Path to the ATK project',
      required: true
    },
    {
      name: 'environment',
      description: 'Target environment (dev, staging, prod)',
      required: true
    }
  ]
};

export function getDeployAgentCompletePrompt(args: Record<string, string>): PromptMessage[] {
  const projectPath = args.projectPath || '.';
  const environment = args.environment || 'dev';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to deploy my agent project at "${projectPath}" to the "${environment}" environment.`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll guide you through the complete deployment workflow for your Microsoft 365 agent. This process includes:

**Deployment Workflow:**
1. **Validation** - Check manifest and configuration
2. **Provisioning** - Create/update cloud resources (if needed)
3. **Deployment** - Deploy code to Azure
4. **Packaging** - Build app package for Microsoft 365
5. **Publishing** - Publish to Microsoft 365 (optional)
6. **Verification** - Confirm deployment success

**Project Details:**
- Path: ${projectPath}
- Environment: ${environment}
- Azure: Required for custom agents
- M365: Final publishing destination

**Prerequisites Check:**
Before starting, ensure:
- ✓ Project is valid ATK project
- ✓ Azure CLI is logged in (az login)
- ✓ Microsoft 365 account is available
- ✓ Appropriate permissions for resource creation

**Step 1: Validation**
Let me start by validating your project manifest and configuration...

[I'll run atk_validate with projectPath="${projectPath}"]

After validation passes, I'll proceed with:
- Provisioning (if not already done)
- Deployment to Azure
- Package creation
- Publishing options

**Estimated Time:** 15-20 minutes total
**Note:** Provisioning and deployment can take several minutes each

Shall I begin with validation?`
      }
    }
  ];
}

/**
 * Setup New Project workflow
 */
export const setupNewProjectPrompt: PromptDefinition = {
  name: 'setup-new-project',
  description: 'Interactive guide for setting up a new ATK project from scratch',
  arguments: [
    {
      name: 'agentType',
      description: 'Type of agent to create (declarative, custom-engine, api-plugin)',
      required: true
    },
    {
      name: 'projectName',
      description: 'Name for the project (optional)',
      required: false
    }
  ]
};

export function getSetupNewProjectPrompt(args: Record<string, string>): PromptMessage[] {
  const agentType = args.agentType || 'declarative-agent';
  const projectName = args.projectName || `my-${agentType}`;

  const agentDescriptions: Record<string, string> = {
    'declarative-agent': 'A TypeSpec-based declarative agent with instructions and configuration. Build sophisticated Microsoft 365 agents using type-safe definitions without custom code. Best for conversational agents, FAQ bots, and knowledge assistants.'
  };

  const description = agentDescriptions[agentType] || 'A TypeSpec-based Microsoft 365 declarative agent';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to create a new ${agentType} project${projectName !== `my-${agentType}` ? ` named "${projectName}"` : ''}.`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `Excellent! I'll help you set up a new ${agentType} project from scratch.

**Agent Type: ${agentType}**
${description}

**Setup Workflow:**
1. **Prerequisites Check** - Verify system requirements
2. **Project Creation** - Scaffold project structure
3. **Configuration** - Set up environments and settings
4. **Initial Validation** - Verify project is ready
5. **Next Steps** - Guidance for development

**Project Configuration:**
- Name: ${projectName}
- Template: ${agentType}
- Format: TypeSpec (type-safe, recommended)
- Structure: Standard ATK layout

**What You'll Get:**
- Complete project scaffolding
- manifest.json with agent configuration
- Source code structure
- Environment configuration files (.env)
- Build and deployment scripts
- m365agents.yml lifecycle configuration

**Development Path:**
After setup, you'll:
1. Customize agent logic and responses
2. Configure integrations and APIs
3. Test locally
4. Deploy to Azure
5. Publish to Microsoft 365

**⚠️ CRITICAL - DO NOT EDIT GENERATED FILES:**
Once scaffolded, NEVER edit:
- appPackage/manifest.json (auto-generated from source)
- appPackage/declarativeAgent.json (auto-generated from source)
- .generated/ folder (all files auto-generated during build)
Edit only: TypeSpec source files (*.tsp), icons, .env files, m365agents.yml

**Prerequisites:**
- Node.js 18+ installed
- npm available
- Azure CLI (for cloud deployment)
- Microsoft 365 account

Let me start by checking prerequisites with atk_doctor...

[After doctor check, I'll create the project with atk_new, then open the new workspace in VS Code to continue working on it directly]

Ready to begin?`
      }
    }
  ];
}

/**
 * Export all workflow prompts
 */
export const workflowPrompts = [
  createDeclarativeAgentPrompt,
  deployAgentCompletePrompt,
  setupNewProjectPrompt
];

/**
 * Get workflow prompt by name
 */
export function getWorkflowPrompt(name: string, args: Record<string, string>): PromptMessage[] | null {
  switch (name) {
    case 'create-declarative-agent':
      return getCreateDeclarativeAgentPrompt(args);
    case 'deploy-agent-complete':
      return getDeployAgentCompletePrompt(args);
    case 'setup-new-project':
      return getSetupNewProjectPrompt(args);
    default:
      return null;
  }
}
