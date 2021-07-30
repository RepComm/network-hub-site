
import { Exponent, EXPONENT_CSS_STYLES, ImagePanel, Panel } from "@repcomm/exponent-ts";
import { Carousel3d } from "./carousel3d";

EXPONENT_CSS_STYLES.mount(document.head);

const STYLES = new Exponent ()
.make("style")
.setTextContent(`
  body {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    background-color: black;
    display: flex;
    margin: 0;
    padding: 0;
  }
`)
.mount(document.head);

async function main () {

  const container = new Panel()
  .setId("container")
  .mount(document.body);

  //create a carousel
  const carousel = new Carousel3d()
  .mount(container);

  for (let i=0; i<10; i++) {
    carousel.create(false);
  }
  carousel.updateItems();

}

main();
