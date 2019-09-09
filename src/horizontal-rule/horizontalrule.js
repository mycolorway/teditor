import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import HorizontalRuleEditing from './horizontalruleediting';
import HorizontalRuleUI from './horizontalruleui';
import './horizontalrulelocale';

export default class HorizontalRule extends Plugin {
  static get requires() {
    return [HorizontalRuleEditing, HorizontalRuleUI];
  }
}
