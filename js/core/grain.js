/* =============================================================================
   Grão de filme: um ruído gerado em canvas uma única vez, usado como
   background de uma camada fixa que "pula" de posição com steps() no CSS.
   ============================================================================= */
(function (H) {
  H.grain = {
    init() {
      const el = document.getElementById('grain');
      const size = 200;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      el.style.backgroundImage = `url(${c.toDataURL('image/png')})`;
      this.el = el;
    },
  };
})(window.HALVORN);
