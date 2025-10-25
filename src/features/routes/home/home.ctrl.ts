import type { Ctrl } from '@features/routes/routes.type';
import dropCsvCtrl from '@features/drop-csv/drop-csv.ctrl';
import langSelectorCtrl from '@features/lang-selector/lang-selector.ctrl';
import { translateStore } from '../../translate/translate.store';
import { getLanguageFromLS } from '../../translate/translate.utils';
import { activeFooterLink } from '@/src/utils/active-footer-link';


const homeCtrl: Ctrl = {
  async init() {
    activeFooterLink('/');

    dropCsvCtrl.init?.();
    langSelectorCtrl.init?.();
    translateStore.setCurrentLanguage(getLanguageFromLS() || 'fr');

  },
  async cleanUp() {
    await dropCsvCtrl.cleanUp?.();
  }
}

export default homeCtrl;
