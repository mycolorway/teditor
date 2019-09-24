import View from '@ckeditor/ckeditor5-ui/src/view';

import '../theme/insertemoji.css';

const defaultConfig = {
  base: 'https://s.tower.im/emoji/',
  paths: [
    'lengtoo_7.gif', 'lengtoo_10.gif', 'lengtoo_11.gif', 'lengtoo_15.gif', 'lengtoo_18.gif', 'lengtoo_20.gif', 'lengtoo_24.gif', 'lengtoo_26.gif', 'lengtoo_29.gif', 'lengtoo_31.gif',
    'smile.png', 'smiley.png', 'laughing.png', 'blush.png', 'heart_eyes.png', 'smirk.png', 'flushed.png', 'grin.png', 'wink.png', 'kissing_closed_eyes.png',
    'stuck_out_tongue_winking_eye.png', 'stuck_out_tongue.png', 'sleeping.png', 'worried.png', 'expressionless.png', 'sweat_smile.png', 'cold_sweat.png', 'joy.png', 'sob.png', 'angry.png',
    'mask.png', 'scream.png', 'sunglasses.png', 'heart.png', 'broken_heart.png', 'star.png', 'anger.png', 'exclamation.png', 'question.png', 'zzz.png',
    'thumbsup.png', 'thumbsdown.png', 'ok_hand.png', 'punch.png', 'v.png', 'clap.png', 'muscle.png', 'pray.png', 'skull.png', 'trollface.png',
  ],
};

export default class InsertTableView extends View {
  constructor({ locale, config }) {
    super(locale);

    this.config = config || defaultConfig;

    this.setTemplate({
      tag: 'div',
      attributes: {
        class: ['ck', 'teditor-emoji-list'],
      },
      children: this.createEmojiElements(),
    });
  }

  createEmojiElements() {
    const bind = this.bindTemplate;
    return this.config.paths.map((path) => ({
      tag: 'div',
      attributes: {
        class: ['emoji'],
      },
      children: [{
        tag: 'img',
        attributes: {
          src: `${this.config.base || ''}${path}`,
        },
      }],
      on: {
        mousedown: bind.to((e) => {
          e.preventDefault();
        }),
        click: bind.to((e) => {
          this.fire('execute', {
            src: e.currentTarget.querySelector('img').getAttribute('src'),
          });
        }),
      },
    }));
  }
}
