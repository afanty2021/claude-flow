# Contributing to Claude-Flow

Thank you for your interest in contributing to Claude-Flow! This guide will help you get started with contributing to this enterprise AI orchestration platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or equivalent package manager
- Git
- Docker (for development environment)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/claude-flow.git
   cd claude-flow
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## 📁 Project Structure

```
claude-flow/
├── src/                    # Source code
│   ├── agents/            # AI agent implementations
│   ├── cli/               # Command-line interface
│   ├── memory/            # Memory management systems
│   └── api/               # API services
├── bin/                   # Executable files
├── tests/                 # Test suites
├── docs/                  # Documentation
├── examples/              # Usage examples
└── scripts/               # Build and utility scripts
```

## 🤝 Contributing Guidelines

### Code Style

- Use TypeScript for new code
- Follow ESLint configuration (`npm run lint`)
- Use Prettier for formatting (`npm run format`)
- Keep files under 500 lines
- Write descriptive commit messages

### Testing

- Write tests before implementing features (TDD)
- Aim for 90%+ code coverage
- Include unit, integration, and E2E tests
- Run full test suite before submitting PR

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following style guidelines
   - Add comprehensive tests
   - Update documentation

3. **Quality Checks**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

4. **Submit Pull Request**
   - Clear title and description
   - Link relevant issues
   - Include screenshots if applicable
   - Request appropriate reviewers

## 🐛 Bug Reports

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Error messages/logs

## 💡 Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Problem statement
- Proposed solution
- Use cases
- Implementation considerations

## 🏗️ Development Areas

We welcome contributions in these areas:

### Core Features
- **Agent System**: New agent types and coordination patterns
- **Memory Management**: Vector search algorithms and storage optimization
- **CLI Interface**: New commands and user experience improvements
- **API Development**: REST endpoints and WebSocket services

### Skills System
- **New Skills**: Domain-specific skills for development workflows
- **Skill Orchestration**: Better skill coordination and memory integration
- **Natural Language**: Improved intent recognition and skill activation

### Performance & Scalability
- **Benchmarking**: Performance testing and optimization
- **Memory Optimization**: Reducing memory footprint and improving search
- **Concurrent Processing**: Enhancing swarm coordination efficiency

### Documentation & Examples
- **Guides**: Tutorials and best practices
- **Examples**: Real-world use cases and demos
- **API Documentation**: OpenAPI specs and detailed docs

### Testing & Quality
- **Test Coverage**: Expanding test suites
- **Integration Tests**: End-to-end scenario testing
- **Performance Tests**: Load testing and benchmarking

## 📋 Development Workflow

### 1. Planning

- Check [GitHub Issues](https://github.com/ruvnet/claude-flow/issues) for open items
- Create new issue for significant features
- Discuss approach in issue comments

### 2. Development

- Use feature branches from main/develop
- Follow SPARC methodology for complex features
- Write tests before implementation (TDD)
- Use meaningful commit messages

### 3. Quality Assurance

- Run full test suite locally
- Ensure all lint checks pass
- Test on multiple Node.js versions
- Verify documentation accuracy

### 4. Submission

- Create pull request with clear description
- Link related issues
- Request appropriate reviewers
- Respond to feedback promptly

## 🧪 Testing Guidelines

### Test Structure

```
tests/
├── unit/              # Unit tests for individual modules
├── integration/       # Integration tests for component interaction
├── e2e/              # End-to-end tests for complete workflows
├── performance/      # Performance and load tests
└── fixtures/         # Test data and mocks
```

### Best Practices

- **Arrange-Act-Assert**: Structure tests clearly
- **Descriptive Names**: Test names should describe the scenario
- **Isolation**: Tests should not depend on each other
- **Mocking**: Use mocks for external dependencies
- **Edge Cases**: Test error conditions and boundary cases

### Example Test

```typescript
describe('Agent Manager', () => {
  describe('createAgent', () => {
    it('should create agent with valid configuration', async () => {
      // Arrange
      const config = { type: 'coder', skill: 'typescript' }

      // Act
      const agent = await agentManager.createAgent(config)

      // Assert
      expect(agent).toBeDefined()
      expect(agent.type).toBe('coder')
      expect(agent.status).toBe('ready')
    })

    it('should throw error for invalid configuration', async () => {
      // Arrange
      const invalidConfig = { type: null }

      // Act & Assert
      await expect(agentManager.createAgent(invalidConfig))
        .rejects.toThrow('Invalid agent configuration')
    })
  })
})
```

## 📖 Documentation

### Types of Documentation

- **API Docs**: Generated from TypeScript types and JSDoc
- **User Guides**: Step-by-step tutorials and workflows
- **Architecture Docs**: System design and patterns
- **Developer Guides**: Contribution and development practices

### Writing Guidelines

- Use clear, concise language
- Include code examples
- Add screenshots where helpful
- Keep documentation up-to-date

## 🏷️ Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

### Release Checklist

1. **Code Quality**
   - [ ] All tests passing
   - [ ] Code coverage >= 90%
   - [ ] No linting errors
   - [ ] Documentation updated

2. **Build & Deploy**
   - [ ] Build successful on all platforms
   - [ ] Docker images built and tested
   - [ ] Version numbers updated
   - [ ] Changelog updated

3. **Release**
   - [ ] Git tag created
   - [ ] Release notes published
   - [ ] npm package published
   - [ ] Docker images pushed

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Collaborate and share knowledge

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Discord**: Real-time chat and community support

## 🏆 Recognition

Contributors are recognized through:

- **Contributors List**: All contributors listed in README
- **Release Notes**: Significant contributions mentioned
- **Community Spotlight**: Featured contributors in communications
- **Swarm Badges**: Special recognition for major contributions

## 📞 Getting Help

- **Documentation**: [Complete guides and tutorials](./docs/)
- **Issues**: [GitHub issues for bugs and features](https://github.com/ruvnet/claude-flow/issues)
- **Discussions**: [GitHub discussions for questions](https://github.com/ruvnet/claude-flow/discussions)
- **Discord**: [Agentics Foundation community](https://discord.com/invite/dfxmpwkG2D)

---

Thank you for contributing to Claude-Flow! Your contributions help advance the future of AI-powered development. 🚀