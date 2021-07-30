import { Button, Exponent, Panel } from "@repcomm/exponent-ts";

export const CAROUSEL3D_STYLES = new Exponent()
.make("style")
.setTextContent(`
.carousel3d {
	transform-style: preserve-3d;
	transition: transform 1s;
	perspective: 4000px;
  transform-origin: 50% 50%;
  margin: 0;
  padding: 0;
  background-image: linear-gradient(black, #320733);
}
.carousel3d-untransformer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.carousel3d-buttons-container {
  flex: 1;
  z-index: 10;
  bottom: 0%;
  position: absolute;
  width: 50%;
  margin-left: 25%;
  margin-bottom: 2em;
  height: 4em;
}
.carousel3d-item {
	position: absolute;

	--ref-width: 20em;
	width: var(--ref-width);
	height: 10em;
	top: 50%;
	left: calc(50% - ( var(--ref-width) / 2 ) );
	
  font-size: large;
	color: white;
	text-align: center;

	transition: transform 1s, opacity 1s, background-size 0.5s;

	background-size: 45% auto;
	background-repeat: no-repeat;
	background-position: 50% 50%;
  background-color: #3c1d38;
  box-shadow: 4px 4px 20px 5px #97348a;
  cursor: pointer;
}
.carousel3d-item:hover {
  box-shadow: 4px 4px 20px 5px #97348a,0px 0px 10px 1px #fff;
  background-size: 40% auto;
}
.carousel3d-item-untransformed {
  visibility: hidden;
}
.carousel3d-button {
	background-color: #210522;
	color: white;
	font-size: x-large;
	margin: 4px;
	border-radius: 0.5em;
	border: 1px solid #ff69d9 !important;
	box-shadow: 0px 0px 20px 1px #c057f0;
}
.carousel3d-button:hover {
  box-shadow: 0px 0px 20px 1px #b486f9;
}
`);

CAROUSEL3D_STYLES.mount(document.head);

const deg2rad = (degrees: number): number => degrees * ( Math.PI / 180);
const rad2deg = (radians: number): number => radians * (180/Math.PI);

export class Carousel3dItem extends Panel {
  constructor () {
    super();
    this.addClasses("carousel3d-item");
  }
}

const random = {
  byte: ()=>Math.floor(Math.random()*255),
  rgb: ()=>`rgb(${random.byte()}, ${random.byte()}, ${random.byte()})`,
  item: <T>(array: Array<T>):T => array[ Math.floor( Math.random() * (array.length) ) ]
}

export const icons = [
  "one.svg",
  "two.svg",
  "three.svg",
  "four.svg"
];

export class Carousel3d extends Panel {
  private untransformer: Panel;
  private measurementItem: Carousel3dItem;
  private items: Set<Carousel3dItem>;

  private buttonsContainer: Panel;

  private btnAdd: Button;
  private btnRemove: Button;
  private btnNext: Button;
  private btnPrev: Button;

  private offsetIndex: number;

  constructor () {
    super();
    this.addClasses("carousel3d");

    this.untransformer = new Panel()
    .addClasses("carousel3d-untransformer")
    .mount(this);

    this.measurementItem = new Carousel3dItem()
    .addClasses("carousel3d-item-untransformed")
    .mount(this.untransformer);

    this.items = new Set();

    this.buttonsContainer = new Panel()
    .addClasses("carousel3d-buttons-container")
    .mount(this);

    this.btnAdd = new Button()
    .addClasses("carousel3d-button")
    .setTextContent("Add")
    .on("click", ()=>{
      this.create();
    })
    .mount(this.buttonsContainer);

    this.btnRemove = new Button()
    .addClasses("carousel3d-button")
    .setTextContent("Remove")
    .on("click", ()=>{
      let firstItem;
      for (let item of this.items) {
        firstItem = item;
        break;
      }
      this.remove(true, firstItem);
    })
    .mount(this.buttonsContainer);


    this.btnPrev = new Button()
    .addClasses("carousel3d-button")
    .setTextContent("<")
    .on("click", ()=>{
      this.offsetIndex++;
      this.updateItems();
    })
    .mount(this.buttonsContainer);


    this.btnNext = new Button()
    .addClasses("carousel3d-button")
    .setTextContent(">")
    .on("click", ()=>{
      this.offsetIndex--;
      this.updateItems();
    })
    .mount(this.buttonsContainer);

    this.offsetIndex = 0;
  }
  add (autoUpdate: boolean = true, ...items: Carousel3dItem[]): this {
    for (let item of items) {
      this.items.add(item);
      item.mount(this);
    }
    this.offsetIndex = 0;
    if (autoUpdate) this.updateItems();
    return this;
  }
  remove (autoUpdate: boolean = true, ...items: Carousel3dItem[]): this {
    for (let item of items) {
      item.unmount();
      this.items.delete(item);
    }
    this.offsetIndex = 0;
    if (autoUpdate) this.updateItems();
    return this;
  }
  updateItems () {
    this.applyCSS();
  }
  applyCSS (): this {
    //measure the non-transformed rect of an item as it won't skew like the others
    let width = this.measurementItem.rect.width;

    let count = this.items.size;
    let angleDeg = 360 / count;
    let angleRad = deg2rad(angleDeg);
    
    let tan = Math.tan(angleRad/2);

    let distance = (width/2) / tan;

    let i=count;
    for (let item of this.items) {
      i--;

      // let rgb = random.rgb();

      // item.setTextContent("Test " + (count-i) );
      // item.setStyleItem("background-color", random.rgb());

      item.setStyleItem("transform", `rotateY(${ (i + this.offsetIndex) * angleDeg }deg) translateZ(${distance}px)`);
    }

    return this;
  }
  create (autoUpdate: boolean = true): Carousel3dItem {
    let result = new Carousel3dItem();

    let rgb = random.rgb();
    // result.setStyleItem("background-color", rgb);
    result.setStyleItem("background-image", `url("./images/svg/${ random.item(icons) }")`)
    // result.setStyleItem("box-shadow", `4px 4px 20px 5px ${rgb}`);

    this.add(autoUpdate, result);

    return result;
  }
}
