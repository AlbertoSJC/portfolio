export function createElementWithClass<TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  className: string,
): HTMLElementTagNameMap[TagName] {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
}

export function createSectionTitle(titleText: string): HTMLParagraphElement {
  const title = createElementWithClass('p', 'menu-section-title');
  title.textContent = titleText;
  return title;
}

export function createHintParagraph(hintText: string): HTMLParagraphElement {
  const hint = createElementWithClass('p', 'village-hint');
  hint.textContent = hintText;
  return hint;
}

export function createCardList(): HTMLDivElement {
  return createElementWithClass('div', 'village-card-list');
}
