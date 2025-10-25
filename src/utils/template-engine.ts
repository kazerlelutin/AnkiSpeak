// Moteur de template simple pour remplacer les variables Handlebars
export function processTemplate(template: string, data: any): string {
  let processed = template;

  // Traiter les conditions if/else d'abord
  processed = processIfElseConditions(processed, data);

  // Remplacer les variables simples {{variable}}
  processed = processed.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
    const trimmed = expression.trim();

    // Variable simple
    return getNestedValue(data, trimmed) || '';
  });

  return processed;
}

function processIfElseConditions(template: string, data: any): string {
  let processed = template;

  // Gérer les conditions {{#if (eq var value)}}...{{else}}...{{/if}}
  const ifElseRegex = /\{\{#if \(eq\s+([^)]+)\)\}\}([^]*?)\{\{else\}\}([^]*?)\{\{\/if\}\}/g;
  processed = processed.replace(ifElseRegex, (match, condition, ifContent, elseContent) => {
    const [varName, expectedValue] = condition.trim().split(/\s+/);
    const actualValue = getNestedValue(data, varName.trim());

    if (actualValue === expectedValue) {
      return ifContent;
    } else {
      return elseContent;
    }
  });

  // Gérer les conditions simples {{#if (eq var value)}}...{{/if}}
  const ifRegex = /\{\{#if \(eq\s+([^)]+)\)\}\}([^]*?)\{\{\/if\}\}/g;
  processed = processed.replace(ifRegex, (match, condition, content) => {
    const [varName, expectedValue] = condition.trim().split(/\s+/);
    const actualValue = getNestedValue(data, varName.trim());

    if (actualValue === expectedValue) {
      return content;
    } else {
      return '';
    }
  });

  // Gérer les conditions simples {{#if variable}}...{{/if}}
  const simpleIfRegex = /\{\{#if\s+([^}]+)\}\}([^]*?)\{\{\/if\}\}/g;
  processed = processed.replace(simpleIfRegex, (match, variable, content) => {
    const value = getNestedValue(data, variable.trim());

    if (value) {
      return content;
    } else {
      return '';
    }
  });

  return processed;
}

function processIfCondition(template: string, expression: string, data: any): string {
  const condition = expression.replace('#if ', '').trim();
  const value = getNestedValue(data, condition);

  if (value) {
    // Extraire le contenu entre {{#if}} et {{/if}}
    const ifRegex = new RegExp(`\\{\\{#if ${condition}\\}\\}([\\s\\S]*?)\\{\\{/if\\}\\}`, 'g');
    return template.replace(ifRegex, '$1');
  } else {
    // Supprimer le contenu entre {{#if}} et {{/if}}
    const ifRegex = new RegExp(`\\{\\{#if ${condition}\\}\\}[\\s\\S]*?\\{\\{/if\\}\\}`, 'g');
    return template.replace(ifRegex, '');
  }
}

function processIfEqCondition(template: string, expression: string, data: any): string {
  // Extraire les paramètres de (eq var value)
  const match = expression.match(/#if \(eq\s+([^)]+)\)/);
  if (!match) return template;

  const params = match[1].split(/\s+/);
  if (params.length !== 2) return template;

  const [varName, expectedValue] = params;
  const actualValue = getNestedValue(data, varName.trim());

  if (actualValue === expectedValue) {
    // Extraire le contenu entre {{#if (eq ...)}} et {{/if}}
    const ifRegex = new RegExp(`\\{\\{#if \\(eq\\s+${varName}\\s+${expectedValue}\\)\\}\\}([\\s\\S]*?)\\{\\{/if\\}\\}`, 'g');
    return template.replace(ifRegex, '$1');
  } else {
    // Supprimer le contenu
    const ifRegex = new RegExp(`\\{\\{#if \\(eq\\s+${varName}\\s+${expectedValue}\\)\\}\\}[\\s\\S]*?\\{\\{/if\\}\\}`, 'g');
    return template.replace(ifRegex, '');
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
