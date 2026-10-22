import { join } from "node:path";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({ cwd: join(__dirname, "..") });

describe("sin textos visibles en componentes", () => {
  it.each(["src/components/Fake.tsx", "src/app/[locale]/fake/page.tsx"])(
    "lint rechaza texto escrito en JSX en %s",
    async (filePath) => {
      const [result] = await eslint.lintText("export const Fake = () => <p>Hola</p>;\n", { filePath });
      const rules = result?.messages.filter((m) => m.severity === 2).map((m) => m.ruleId);
      expect(rules).toContain("react/jsx-no-literals");
    },
  );

  it("lint acepta textos que vienen de los mensajes", async () => {
    const [result] = await eslint.lintText(
      'export const Fake = ({ t }: { t: (k: string) => string }) => <p className="x">{t("hola")}</p>;\n',
      { filePath: "src/components/Fake.tsx" },
    );
    expect(result?.messages).toEqual([]);
  });
});
