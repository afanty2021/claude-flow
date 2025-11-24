# Claude Code Configuration - SPARC Development Environment

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS**:
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 🎯 CRITICAL: Claude Code Task Tool for Agent Execution

**Claude Code's Task tool is the PRIMARY way to spawn agents:**
```javascript
// ✅ CORRECT: Use Claude Code's Task tool for parallel agent execution
[Single Message]:
  Task("Research agent", "Analyze requirements and patterns...", "researcher")
  Task("Coder agent", "Implement core features...", "coder")
  Task("Tester agent", "Create comprehensive tests...", "tester")
  Task("Reviewer agent", "Review code quality...", "reviewer")
  Task("Architect agent", "Design system architecture...", "system-architect")
```

**MCP tools are ONLY for coordination setup:**
- `mcp__claude-flow__swarm_init` - Initialize coordination topology
- `mcp__claude-flow__agent_spawn` - Define agent types for coordination
- `mcp__claude-flow__task_orchestrate` - Orchestrate high-level workflows

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation and markdown files
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/examples` - Example code

## Project Overview

This project uses SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology with Claude-Flow orchestration for systematic Test-Driven Development.

## 📋 项目配置文件架构

### 核心配置文件
- **`package.json`** - 项目元数据、依赖管理和脚本命令
- **`Dockerfile`** - 多阶段生产就绪镜像构建配置
- **`docker-compose.yml`** - 容器编排配置（Redis + Nginx + Claude-Flow）
- **`.github/workflows/`** - GitHub Actions CI/CD 管道配置
- **`.gitignore`** - 版本控制忽略规则（包含项目特定配置）

### 安全与质量配置
- **`.audit-ci.json`** - 安全审计配置
- **`codecov.yml`** - 代码覆盖率报告配置
- **`.github/dependabot.yml`** - 依赖更新自动化
- **`.pre-commit-config.yaml`** - Git 提交前检查钩子

### Claude-Flow 特定配置
- **`.claude-flow/`** - 运行时配置和数据存储
  - `swarm-config.json` - 群体协调配置
  - `pipeline-config.json` - 流水线配置
  - `agents-profiles.json` - 代理角色配置
  - `tasks/` - 任务队列和历史
  - `sessions/` - 会话管理
  - `models/` - AI 模型配置
  - `metrics/` - 性能监控数据

## 🚀 项目初始化流程

### 环境准备
```bash
# 1. 克隆项目
git clone https://github.com/ruvnet/claude-flow.git
cd claude-flow

# 2. 环境检查
node --version  # 需要 >= 20.0.0
npm --version   # 需要 >= 9.0.0

# 3. 安装依赖
npm install

# 4. 设置开发环境
npm run prepare  # 安装 Git hooks
```

### Docker 环境设置
```bash
# 开发环境
docker-compose up -d

# 生产构建
docker build -t claude-flow .
docker run -p 3000:3000 claude-flow
```

### MCP 服务器配置
```bash
# 核心服务（必需）
claude mcp add claude-flow npx claude-flow@alpha mcp start

# 增强协调（可选）
claude mcp add ruv-swarm npx ruv-swarm mcp start

# 云功能（可选，需要注册）
claude mcp add flow-nexus npx flow-nexus@latest mcp start
```

## 🛠️ 可用脚本命令

### 开发命令
```bash
# 开发服务器
npm run dev

# 构建项目
npm run build

# 类型检查
npm run typecheck
npm run typecheck:watch

# 代码格式化
npm run format
npm run format:check

# 代码检查
npm run lint
npm run lint:fix
```

### 测试命令
```bash
# 基础测试
npm test
npm run test:watch

# 分类测试
npm run test:unit          # 单元测试
npm run test:integration   # 集成测试
npm run test:e2e          # 端到端测试
npm run test:performance  # 性能测试

# 覆盖率报告
npm run test:coverage
npm run test:coverage:unit
npm run test:coverage:integration
npm run test:coverage:e2e

# 综合测试（包含负载、Docker、NPX 测试）
npm run test:comprehensive
npm run test:comprehensive:full
```

### 安全与质量
```bash
# 安全审计
npm run security:check
npm run security:fix

# 健康检查
npm run health-check
npm run diagnostics
```

### Docker 命令
```bash
# Docker 构建
npm run docker:build
npm run docker:run

# Docker Compose
npm run docker:dev
npm run docker:down
```

### 发布命令
```bash
# 版本管理
npm run publish:alpha
npm run publish:major
npm run publish:minor
npm run publish:patch

# 文档生成
npm run docs:build
npm run docs:serve

# 变更日志
npm run changelog
```

## SPARC Commands

### Core Commands
- `npx claude-flow sparc modes` - List available modes
- `npx claude-flow sparc run <mode> "<task>"` - Execute specific mode
- `npx claude-flow sparc tdd "<feature>"` - Run complete TDD workflow
- `npx claude-flow sparc info <mode>` - Get mode details

### Batchtools Commands
- `npx claude-flow sparc batch <modes> "<task>"` - Parallel execution
- `npx claude-flow sparc pipeline "<task>"` - Full pipeline processing
- `npx claude-flow sparc concurrent <mode> "<tasks-file>"` - Multi-task processing

## SPARC Workflow Phases

1. **Specification** - Requirements analysis (`sparc run spec-pseudocode`)
2. **Pseudocode** - Algorithm design (`sparc run spec-pseudocode`)
3. **Architecture** - System design (`sparc run architect`)
4. **Refinement** - TDD implementation (`sparc tdd`)
5. **Completion** - Integration (`sparc run integration`)

## 🔧 开发工作流程

### 新功能开发流程
1. **创建功能分支**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **运行 SPARC 规范阶段**
   ```bash
   npx claude-flow sparc run spec-pseudocode "实现新功能"
   ```

3. **架构设计**
   ```bash
   npx claude-flow sparc run architect "新功能架构设计"
   ```

4. **TDD 实现**
   ```bash
   npx claude-flow sparc tdd "新功能开发"
   ```

5. **集成与测试**
   ```bash
   npm run test:comprehensive
   npm run lint
   npm run typecheck
   ```

### 代理协调开发
```javascript
// 完整功能的代理协调示例
[Single Message - Parallel Agent Execution]:
  Task("产品经理", "分析用户需求并制定产品规范", "planner")
  Task("架构师", "设计系统架构和技术选型", "system-architect")
  Task("前端开发者", "实现 React 用户界面", "coder")
  Task("后端开发者", "构建 REST API 和数据库", "backend-dev")
  Task("测试工程师", "编写自动化测试套件", "tester")
  Task("安全审查员", "进行安全审计和漏洞扫描", "reviewer")
  Task("DevOps 工程师", "配置 CI/CD 流水线", "cicd-engineer")

  TodoWrite { todos: [
    {id: "1", content: "需求分析和产品规范", status: "in_progress", priority: "high"},
    {id: "2", content: "系统架构设计", status: "pending", priority: "high"},
    {id: "3", content: "数据库模型设计", status: "pending", priority: "high"},
    {id: "4", content: "前端界面开发", status: "pending", priority: "medium"},
    {id: "5", content: "后端 API 开发", status: "pending", priority: "medium"},
    {id: "6", content: "单元测试编写", status: "pending", priority: "medium"},
    {id: "7", content: "集成测试配置", status: "pending", priority: "medium"},
    {id: "8", content: "CI/CD 流水线设置", status: "pending", priority: "low"},
    {id: "9", content: "文档编写", status: "pending", priority: "low"},
    {id: "10", content: "性能优化", status: "pending", priority: "low"}
  ]}
```

## Code Style & Best Practices

- **Modular Design**: Files under 500 lines
- **Environment Safety**: Never hardcode secrets
- **Test-First**: Write tests before implementation
- **Clean Architecture**: Separate concerns
- **Documentation**: Keep updated
- **Security**: Follow security best practices
- **Performance**: Monitor and optimize bottlenecks

## 🚀 Available Agents (54 Total)

### Core Development
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### Swarm Coordination
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`, `collective-intelligence-coordinator`, `swarm-memory-manager`

### Consensus & Distributed
`byzantine-coordinator`, `raft-manager`, `gossip-coordinator`, `consensus-builder`, `crdt-synchronizer`, `quorum-manager`, `security-manager`

### Performance & Optimization
`perf-analyzer`, `performance-benchmarker`, `task-orchestrator`, `memory-coordinator`, `smart-agent`

### GitHub & Repository
`github-modes`, `pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`, `workflow-automation`, `project-board-sync`, `repo-architect`, `multi-repo-swarm`

### SPARC Methodology
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`, `refinement`

### Specialized Development
`backend-dev`, `mobile-dev`, `ml-developer`, `cicd-engineer`, `api-docs`, `system-architect`, `code-analyzer`, `base-template-generator`

### Testing & Validation
`tdd-london-swarm`, `production-validator`

### Migration & Planning
`migration-planner`, `swarm-init`

## 🎯 Claude Code vs MCP Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn and run agents concurrently for actual work
- File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
- Code generation and programming
- Bash commands and system operations
- Implementation work
- Project navigation and analysis
- TodoWrite and task management
- Git operations
- Package management
- Testing and debugging

### MCP Tools ONLY COORDINATE:
- Swarm initialization (topology setup)
- Agent type definitions (coordination patterns)
- Task orchestration (high-level planning)
- Memory management
- Neural features
- Performance tracking
- GitHub integration

**KEY**: MCP coordinates the strategy, Claude Code's Task tool executes with real agents.

## 🔒 安全配置与最佳实践

### 安全审计配置
```json
// .audit-ci.json
{
  "low": true,
  "moderate": true,
  "high": true,
  "critical": true,
  "report-type": "summary",
  "allowlist": []
}
```

### 依赖安全扫描
```bash
# 高级别安全审计
npm audit --audit-level=high

# 生产依赖审计
npm audit --production --audit-level=moderate

# 许可证合规检查
npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC0-1.0'
```

### Git 安全配置
- Pre-commit hooks 代码质量检查
- Dependabot 自动依赖更新
- 分支保护和 PR 审查策略

## 🐳 Docker 配置说明

### 多阶段构建
- **Base Stage**: Node.js Alpine 基础镜像
- **Deps Stage**: 依赖安装和缓存
- **Builder Stage**: 项目构建
- **Runner Stage**: 生产运行时环境

### 服务编排
- **claude-flow**: 主应用服务
- **Redis**: 缓存和会话存储
- **Nginx**: 反向代理和负载均衡

### 健康检查
- 应用健康检查端点
- Redis 连接检查
- Nginx 状态监控

## 🔄 CI/CD 流水线

### GitHub Actions 工作流
- **Security & Code Quality**: 安全审计、代码检查、类型检查
- **Test Suite**: 多环境测试、覆盖率报告
- **Documentation**: 文档生成和验证
- **Build & Package**: 项目构建和打包
- **Deploy & Release**: 自动部署和发布管理

### 分支策略
- **main**: 生产就绪代码
- **develop**: 开发集成分支
- **feature/***: 功能开发分支
- **hotfix/***: 紧急修复分支

## 📊 监控与诊断

### 性能监控
```bash
# 系统诊断
npm run diagnostics

# 健康检查
npm run health-check

# 性能基准测试
npm run test:benchmark
```

### 监控指标
- 代理执行性能
- 内存使用情况
- 任务完成率
- 错误率和响应时间

## 🌐 Flow-Nexus 云功能集成（可选）

### 注册和认证
```bash
# 注册账户
npx flow-nexus@latest register

# 登录
npx flow-nexus@latest login

# 访问 70+ 专业 MCP 工具
```

### 云功能特性
- **沙盒执行**: 云端代码执行环境
- **模板库**: 预构建项目模板
- **神经 AI**: 高级 AI 助手功能
- **实时监控**: 实时执行流订阅
- **云存储**: 文件管理和同步

## 🎯 Agent Execution Flow with Claude Code

### The Correct Pattern:

1. **Optional**: Use MCP tools to set up coordination topology
2. **REQUIRED**: Use Claude Code's Task tool to spawn agents that do actual work
3. **REQUIRED**: Each agent runs hooks for coordination
4. **REQUIRED**: Batch all operations in single messages

### Example Full-Stack Development:

```javascript
// Single message with all agent spawning via Claude Code's Task tool
[Parallel Agent Execution]:
  Task("Backend Developer", "Build REST API with Express. Use hooks for coordination.", "backend-dev")
  Task("Frontend Developer", "Create React UI. Coordinate with backend via memory.", "coder")
  Task("Database Architect", "Design PostgreSQL schema. Store schema in memory.", "code-analyzer")
  Task("Test Engineer", "Write Jest tests. Check memory for API contracts.", "tester")
  Task("DevOps Engineer", "Setup Docker and CI/CD. Document in memory.", "cicd-engineer")
  Task("Security Auditor", "Review authentication. Report findings via hooks.", "reviewer")

  // All todos batched together
  TodoWrite { todos: [...8-10 todos...] }

  // All file operations together
  Write "backend/server.js"
  Write "frontend/App.jsx"
  Write "database/schema.sql"
```

## 📋 Agent Coordination Protocol

### Every Agent Spawned via Task Tool MUST:

**1️⃣ BEFORE Work:**
```bash
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

**2️⃣ DURING Work:**
```bash
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/[agent]/[step]"
npx claude-flow@alpha hooks notify --message "[what was done]"
```

**3️⃣ AFTER Work:**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task]"
npx claude-flow@alpha hooks session-end --export-metrics true
```

## 🎯 Concurrent Execution Examples

### ✅ CORRECT WORKFLOW: MCP Coordinates, Claude Code Executes

```javascript
// Step 1: MCP tools set up coordination (optional, for complex tasks)
[Single Message - Coordination Setup]:
  mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 6 }
  mcp__claude-flow__agent_spawn { type: "researcher" }
  mcp__claude-flow__agent_spawn { type: "coder" }
  mcp__claude-flow__agent_spawn { type: "tester" }

// Step 2: Claude Code Task tool spawns ACTUAL agents that do the work
[Single Message - Parallel Agent Execution]:
  // Claude Code's Task tool spawns real agents concurrently
  Task("Research agent", "Analyze API requirements and best practices. Check memory for prior decisions.", "researcher")
  Task("Coder agent", "Implement REST endpoints with authentication. Coordinate via hooks.", "coder")
  Task("Database agent", "Design and implement database schema. Store decisions in memory.", "code-analyzer")
  Task("Tester agent", "Create comprehensive test suite with 90% coverage.", "tester")
  Task("Reviewer agent", "Review code quality and security. Document findings.", "reviewer")

  // Batch ALL todos in ONE call
  TodoWrite { todos: [
    {id: "1", content: "Research API patterns", status: "in_progress", priority: "high"},
    {id: "2", content: "Design database schema", status: "in_progress", priority: "high"},
    {id: "3", content: "Implement authentication", status: "pending", priority: "high"},
    {id: "4", content: "Build REST endpoints", status: "pending", priority: "high"},
    {id: "5", content: "Write unit tests", status: "pending", priority: "medium"},
    {id: "6", content: "Integration tests", status: "pending", priority: "medium"},
    {id: "7", content: "API documentation", status: "pending", priority: "low"},
    {id: "8", content: "Performance optimization", status: "pending", priority: "low"}
  ]}

  // Parallel file operations
  Bash "mkdir -p app/{src,tests,docs,config}"
  Write "app/package.json"
  Write "app/src/server.js"
  Write "app/tests/server.test.js"
  Write "app/docs/API.md"
```

### ❌ WRONG (Multiple Messages):
```javascript
Message 1: mcp__claude-flow__swarm_init
Message 2: Task("agent 1")
Message 3: TodoWrite { todos: [single todo] }
Message 4: Write "file.js"
// This breaks parallel coordination!
```

## Performance Benefits

- **84.8% SWE-Bench solve rate**
- **32.3% token reduction**
- **2.8-4.4x speed improvement**
- **27+ neural models**

## Hooks Integration

### Pre-Operation
- Auto-assign agents by file type
- Validate commands for safety
- Prepare resources automatically
- Optimize topology by complexity
- Cache searches

### Post-Operation
- Auto-format code
- Train neural patterns
- Update memory
- Analyze performance
- Track token usage

### Session Management
- Generate summaries
- Persist state
- Track metrics
- Restore context
- Export workflows

## Advanced Features (v2.0.0)

- 🚀 Automatic Topology Selection
- ⚡ Parallel Execution (2.8-4.4x speed)
- 🧠 Neural Training
- 📊 Bottleneck Analysis
- 🤖 Smart Auto-Spawning
- 🛡️ Self-Healing Workflows
- 💾 Cross-Session Memory
- 🔗 GitHub Integration

## Integration Tips

1. Start with basic swarm init
2. Scale agents gradually
3. Use memory for context
4. Monitor progress regularly
5. Train patterns from success
6. Enable hooks automation
7. Use GitHub tools first

## 🔧 故障排除

### 常见问题
1. **MCP 服务器连接失败**
   - 检查网络连接
   - 重新注册 MCP 服务器
   - 验证 Node.js 版本兼容性

2. **Docker 构建失败**
   - 清理 Docker 缓存
   - 检查基础镜像可用性
   - 验证依赖安装

3. **测试超时**
   - 调整测试超时配置
   - 检查资源使用情况
   - 并行测试设置

### 调试命令
```bash
# 详细日志输出
DEBUG=claude-flow:* npx claude-flow <command>

# 性能分析
npm run test:benchmark

# 系统诊断
npm run diagnostics
```

## Support

- Documentation: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues
- Flow-Nexus Platform: https://flow-nexus.ruv.io (registration required for cloud features)

---

Remember: **Claude Flow coordinates, Claude Code creates!**

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
Never save working files, text/mds and tests to the root folder.