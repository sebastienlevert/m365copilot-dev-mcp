# VS Code / GitHub Copilot Workflow

This document explains the recommended workflow when using the ATK MCP server with VS Code and GitHub Copilot.

## Overview

When you create a new agent project using `atk_new`, the MCP server will instruct the coding agent (GitHub Copilot) to open the newly created workspace in VS Code and continue the conversation there. This provides a seamless transition from project creation to active development.

## Why This Matters

**Problem:** When creating a new project in one directory while VS Code is open in another directory, the coding agent cannot access the new project files and continues working in the wrong context.

**Solution:** The MCP server now explicitly instructs GitHub Copilot to:
1. Open the newly created workspace in VS Code
2. Continue the chat session in the new workspace context
3. This allows direct file manipulation and better understanding of the project structure

## Workflow Steps

### 1. Create Project
User asks to create a new agent:
```
"Create a new declarative agent called my-sales-agent"
```

### 2. ATK MCP Server Response
The `atk_new` tool creates the project and returns:
```
✅ Successfully created Microsoft 365 declarative agent project

🔴 CRITICAL FOR VS CODE / GITHUB COPILOT:
The project has been created at: ~/AgentsToolkitProjects/my-sales-agent

YOU MUST NOW OPEN THIS WORKSPACE IN VS CODE AND CONTINUE THE CONVERSATION THERE:
1. Open the new workspace in VS Code
2. Continue this chat session in the new workspace context
3. This allows you to work with the project files directly
```

### 3. GitHub Copilot Action
GitHub Copilot should:
1. Recognize the instruction to switch workspaces
2. Open `~/AgentsToolkitProjects/my-sales-agent` in VS Code
3. Continue the conversation in the new workspace context

### 4. Continued Development
Once in the new workspace, the user and GitHub Copilot can:
- Review project files
- Edit TypeSpec source files
- Validate the project
- Build and deploy
- All with proper file context

## Benefits

### For Users
- Seamless workflow from creation to development
- No manual switching between directories
- Chat context preserved in new workspace
- Immediate access to all project files

### For GitHub Copilot
- Proper workspace context for file operations
- Access to project structure and files
- Better code suggestions based on project files
- Can read TypeSpec definitions, manifests, etc.

## Technical Implementation

### Tool Description
The `atk_new` tool description includes:
```
**IMPORTANT FOR VS CODE / GITHUB COPILOT:**
After successful project creation, you MUST open the newly created workspace
in VS Code and continue the chat session there. This is essential for working
with the project files directly. The success message will include the exact
workspace path.
```

### Success Message
The success message prominently displays:
```
🔴 CRITICAL FOR VS CODE / GITHUB COPILOT:
The project has been created at: {projectPath}

YOU MUST NOW OPEN THIS WORKSPACE IN VS CODE AND CONTINUE THE CONVERSATION THERE:
1. Open the new workspace in VS Code
2. Continue this chat session in the new workspace context
3. This allows you to work with the project files directly
```

### Workflow Prompts
Guided prompts (`create-declarative-agent`, `setup-new-project`) include workspace switching instructions:
```
**Next Steps After Creation:**
1. **IMPORTANT FOR VS CODE:** I will open the new workspace in VS Code
   and continue our conversation there
2. Review the TypeSpec source files (src/*.tsp) for your agent
...
```

## Fallback for Command Line

For command-line environments or when workspace switching isn't available, the success message also includes:
```
**For command line environments:**
cd ~/AgentsToolkitProjects/my-sales-agent
```

## Example Conversation

**User:** "Create a declarative agent for customer support"

**GitHub Copilot:** "I'll create a declarative agent project for you."
*[Uses atk_new tool]*

**MCP Server Response:**
```
✅ Successfully created Microsoft 365 declarative agent project

🔴 CRITICAL FOR VS CODE / GITHUB COPILOT:
The project has been created at: ~/AgentsToolkitProjects/customer-support-agent

YOU MUST NOW OPEN THIS WORKSPACE IN VS CODE AND CONTINUE THE CONVERSATION THERE:
...
```

**GitHub Copilot:** "I've created your customer support agent project. Let me open the workspace in VS Code now."
*[Opens ~/AgentsToolkitProjects/customer-support-agent in VS Code]*

**GitHub Copilot (in new workspace):** "Now that we're in the project workspace, I can help you customize your agent. Let me show you the TypeSpec files where you can define your agent's behavior..."
*[Can now read and edit files directly]*

## Best Practices

### For Users
1. **Trust the workflow** - Let GitHub Copilot handle the workspace switching
2. **Wait for confirmation** - Ensure the new workspace has opened before continuing
3. **Review context** - Verify you're in the correct project directory
4. **Continue naturally** - The conversation context is preserved

### For GitHub Copilot Implementation
1. **Recognize the instruction** - Look for "🔴 CRITICAL FOR VS CODE" marker
2. **Parse the path** - Extract the workspace path from the success message
3. **Switch workspace** - Open the new directory in VS Code
4. **Maintain context** - Preserve the conversation history
5. **Confirm switch** - Let the user know you've opened the new workspace

## Troubleshooting

### Workspace Doesn't Open
- Check if GitHub Copilot has permissions to open workspaces
- Verify the path exists: `~/AgentsToolkitProjects/{project-name}`
- Try opening manually: File → Open Folder

### Chat Context Lost
- If context is lost, remind GitHub Copilot: "We just created a new agent project"
- Reference the project name to re-establish context

### Wrong Workspace
- Verify you're in the correct directory: Check VS Code's bottom status bar
- Close and reopen the correct workspace if needed

## Future Enhancements

Potential improvements to this workflow:
- Automatic workspace file exploration after opening
- Pre-populated context about project structure
- Suggested next steps based on agent type
- Integration with VS Code workspace settings

## Summary

The ATK MCP server now provides explicit instructions for VS Code / GitHub Copilot to:
✅ Open newly created workspaces automatically
✅ Continue chat sessions in the new context
✅ Enable direct file manipulation
✅ Provide better project awareness

This creates a seamless, intuitive workflow from project creation to active development.
