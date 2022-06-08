
import { MyDisplay } from "../core/myDisplay";
import { Tween } from "../core/tween";
import { Expo } from "gsap";

// -----------------------------------------
//
// -----------------------------------------
export class Item extends MyDisplay {

  private _id:number;
  private _input:any;

  constructor(opt:any) {
    super(opt)

    this._id = opt.id;
    this._c = this._id * 2;

    this._input = document.createElement('input');
    this._input.setAttribute('type', 'range');
    this._input.setAttribute('min', '0');
    this._input.setAttribute('max', '100');
    this._input.setAttribute('step', '1');
    this.getEl().append(this._input);

    Tween.instance.set(this._input, {
      width:opt.width,
      height:opt.height,
      y:-opt.height * 1
    })

    // スライダー行ったり来たりさせる
    this._motion(this._id * 0.05);

    this._resize();
  }


  private _motion(delay:number = 0): void {
    Tween.instance.a(this._input, {
      value:[0, 100]
    }, 1, delay, Expo.easeInOut, null, null, () => {
      Tween.instance.a(this._input, {
        value:0
      }, 1, 0, Expo.easeInOut, null, null, () => {
        this._motion();
      })
    })
  }
}