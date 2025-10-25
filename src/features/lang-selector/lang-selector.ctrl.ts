import { cook } from "@/src/utils/kitchen";
import { LANG_SELECTOR_ID, LANG_SELECTOR_OPTIONS } from "./lang-selector.const";
import { translateStore } from "../translate/translate.store";

const langSelectorCtrl = {
  init() {
    const languageSelect = document.getElementById('language-select');

    if (!languageSelect) {
      return;
    }


    const fragment = document.createDocumentFragment();
    LANG_SELECTOR_OPTIONS.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label[translateStore.currentLanguage];
      if (option.value === 'ko-KR') {
        optionElement.setAttribute('selected', 'selected');
      }
      fragment.appendChild(optionElement);
    });

    languageSelect.appendChild(fragment);

    cook(LANG_SELECTOR_ID, () => {
      languageSelect.appendChild(fragment);
    })
  },
  changeLanguage(event: Event) {
    const language = (event.target as HTMLSelectElement).value;
    console.log(language);
  }
}

export default langSelectorCtrl;