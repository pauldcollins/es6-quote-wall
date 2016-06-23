
// Utils/Generic code
class Color {
  constructor(red, green, blue) {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  rgb() {
    return `rgb(${this.red}, ${this.green}, ${this.blue})`;
  }
}


class ColorUtils {
  static generateRandomColor() {
    let red = Math.floor((Math.random() * 256));
    let green = Math.floor((Math.random() * 256));
    let blue = Math.floor((Math.random() * 256));

    return new Color(red, green, blue);
  }

  static generateRandomPastelColor() {
    const PASTEL_CONSTANT = 240;
    let color = this.generateRandomColor();

    let pastelRed = Math.floor((color.red + PASTEL_CONSTANT) / 2);
    let pastelGreen = Math.floor((color.green + PASTEL_CONSTANT) / 2);
    let pastelBlue = Math.floor((color.blue + PASTEL_CONSTANT) / 2);

    return new Color(pastelRed, pastelGreen, pastelBlue);
  }
}


// Public API
window.QuoteWallApp = {
  apis: {},
  models: {},
  controllers: {},
  views: {},
  storage: {}
};


// Application code
{
  const FORTUNE_FETCH_TIMEOUT = 10000;
  const FALLBACK_FORTUNE = 'All great changes are preceded by chaos';
  const FADE_TIME = 500;


  class FortuneAPI {
    static fetch() {
      return $.ajax({
        url: 'http://goo.gl/7dVUP3',
        type: 'GET',
        timeout: FORTUNE_FETCH_TIMEOUT
      });
    }
  }


  class Fortune {
    constructor(message) {
      this.message = message;
    }
  }


  class FortuneStorage {
    constructor() {
      this.fortunes = [];
      this.setup();
    }

    setup() {
      this.load();
    }

    load() {
      this.fortunes = JSON.parse(localStorage.getItem('fortunes')) || [];
    }

    add(fortune) {
      this.fortunes.push(fortune);
      this.save();
    }

    deleteAtIndex(index) {
      this.fortunes.splice(index, 1);
      this.save();
    }

    save() {
      localStorage.setItem('fortunes', JSON.stringify(this.fortunes));
    }
  }


  /**
   *
   * @param {Fortune} fortune
   * @returns {*|jQuery|HTMLElement}
   */
  class FortuneView {
    static createElement(fortune) {
      let color = ColorUtils.generateRandomPastelColor();

      let $el = $(`<div class="fortune" style="background: ${color.rgb()}" />`);

      $el.prepend($('<div />', {
        text: fortune.message
      }));

      $el.append($('<div />', {
        class: 'delete-fortune glyphicon glyphicon-remove'
      }));

      return $el;
    }
  }


  class QuoteWallController {
    constructor(elementSelector) {
      this.$el = $(elementSelector);
      this.$loadingOverlay = $(window.document.body).find('.loading-overlay');
      this.fortuneStorage = new FortuneStorage();
      this.fortunes = this.fortuneStorage.fortunes;
      this.setup();
    }

    setup() {
      $(this.$el).on('click', '.get-fortune', (e) => this.onGetQuoteButtonClicked(e));
      $(this.$el).on('click', '.delete-fortune', (e) => this.onQuoteDeleteButtonClicked(e));

      this.renderAllFortunes();
    }

    fetchNewFortune() {
      FortuneAPI.fetch()

        .then((data) => {
          // data is sometimes in multiple arrays, so we need to join them
          let fortuneText = data.fortune.join(' ');
          let fortune = new Fortune(fortuneText);

          // store fortune in
          this.fortuneStorage.add(fortune);
          this.renderSingleFortune(fortune);
        })

        .fail(() => {
          let fortune = new Fortune(FALLBACK_FORTUNE);
          this.renderSingleFortune(fortune);
          this.fortuneStorage.add(fortune);
        })

        .always(() => this.$loadingOverlay.hide());
    }

    onGetQuoteButtonClicked() {
      this.$loadingOverlay.show();
      this.fetchNewFortune();
    }

    onQuoteDeleteButtonClicked(e) {
      let $fortune = $(e.currentTarget).closest('.fortune');
      let fortuneIndex = this.$el.find('.fortune').index($fortune);

      $fortune.fadeOut(() => $(this).remove());
      this.fortuneStorage.deleteAtIndex(fortuneIndex);
    }

    /**
     *
     * @param {Fortune} fortune
     */
    renderSingleFortune(fortune) {
      let $fortune = FortuneView.createElement(fortune)
        .hide().fadeIn(FADE_TIME).css('display', 'inherit');
      this.$el.find('.button-area:last').before($fortune);
    }

    renderAllFortunes() {
      let $fortunes = this.fortunes.map((fortune) => FortuneView.createElement(fortune));
      this.$el.prepend($fortunes).hide().fadeIn(FADE_TIME);
    }
  }

  // Define exports for application
  window.QuoteWallApp.apis.FortuneAPI = FortuneAPI;
  window.QuoteWallApp.models.FortuneStorage = FortuneStorage;
  window.QuoteWallApp.controllers.QuoteWallController = QuoteWallController;
  window.QuoteWallApp.views.FortuneStorage = FortuneStorage;
  window.QuoteWallApp.storage.FortuneView = FortuneView;
}
