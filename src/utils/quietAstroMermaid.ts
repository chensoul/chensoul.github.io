import astroMermaid from "astro-mermaid";

type AstroMermaidOptions = Parameters<typeof astroMermaid>[0];
type AstroIntegration = ReturnType<typeof astroMermaid>;

function muteMermaidClientLogs(code: string): string {
  return code.replace(/console\.log\(/g, "void 0&&console.log(");
}

export default function quietAstroMermaid(
  options?: AstroMermaidOptions
): AstroIntegration {
  const integration = astroMermaid(options);
  const originalSetup = integration.hooks["astro:config:setup"];

  if (!originalSetup) return integration;

  return {
    ...integration,
    hooks: {
      ...integration.hooks,
      "astro:config:setup": async args => {
        const silentLogger = {
          ...args.logger,
          info: () => {},
        } as unknown as typeof args.logger;

        await originalSetup({
          ...args,
          logger: silentLogger,
          injectScript: (stage, content) =>
            args.injectScript(
              stage,
              typeof content === "string"
                ? muteMermaidClientLogs(content)
                : content
            ),
        });
      },
    },
  };
}
