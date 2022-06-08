
import { Bodies, Body, Composite, Composites, Constraint, Engine, Events, Mouse, MouseConstraint, Render, Runner } from "matter-js";
import { Func } from "../core/func";
import { MyDisplay } from "../core/myDisplay";
import { Tween } from "../core/tween";
import { Util } from "../libs/util";
import { Item } from "./item";
import { Rect } from "../libs/rect";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  public engine:Engine;
  public render:Render;

  // 外枠
  private _frame:Array<Body> = [];

  private _stack:Composite;
  private _stackSize:Rect = new Rect(0,0,50,20);

  // 表示用UIパーツ
  private _item:Array<Item> = [];


  constructor(opt:any) {
    super(opt)

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    // エンジン
    this.engine = Engine.create();

    // レンダラー
    this.render = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: sw,
        height: sh,
        showAngleIndicator: true,
        showCollisions: true,
        showVelocity: true
      }
    });

    let group = Body.nextGroup(true);

    this._stack = Composites.stack(sw * 0.5 - 50, 100, 20, 1, 0, 0, (x:any, y:any) => {
      return Bodies.rectangle(x, y, this._stackSize.width, this._stackSize.height, { collisionFilter: { group: group } });
    });

    Composites.chain(this._stack, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2, render: { type: 'line' } });
    Composite.add(this._stack, Constraint.create({
        bodyB: this._stack.bodies[0],
        pointB: { x: -25, y: 0 },
        pointA: { x: this._stack.bodies[0].position.x, y: this._stack.bodies[0].position.y },
        stiffness: 0.8
    }));

    Composite.add(this.engine.world, [
      this._stack,
    ]);

    // マウス
    const mouse = Mouse.create(this.render.canvas)
    const mouseConstraint = MouseConstraint.create(this.engine, {
      mouse:mouse,
    });
    Composite.add(this.engine.world, mouseConstraint);
    this.render.mouse = mouse;

    // run the renderer
    Render.run(this.render);

    // create runner
    const runner:Runner = Runner.create();

    // run the engine
    Runner.run(runner, this.engine);

    // 描画後イベント
    Events.on(this.render, 'afterRender', () => {
      this._eAfterRender();
    })

    // 表示用パーツ
    const num = this._stack.bodies.length;
    for(let i = 0; i < num; i++) {
      const el = document.createElement('div');
      el.classList.add('item');
      this.getEl().append(el);

      const item = new Item({
        el:el,
        width: this._stackSize.width,
        height: this._stackSize.height
      });
      this._item.push(item);
    }

    this._resize();
  }


  private _eAfterRender(): void {
    // 物理演算結果をパーツに反映
    this._stack.bodies.forEach((val,i) => {
      const item = this._item[i];
      const pos = val.position
      Tween.instance.set(item.getEl(), {
        x:pos.x - this._stackSize.width * 0.5,
        y:pos.y - this._stackSize.height * 0.5,
        rotationZ:Util.instance.degree(val.angle),
      })
    })
  }


  private _makeFrame(): void {
    // 一旦破棄
    if(this._frame.length > 0) {
      Composite.remove(this.engine.world, this._frame[0])
      Composite.remove(this.engine.world, this._frame[1])
      Composite.remove(this.engine.world, this._frame[2])
      Composite.remove(this.engine.world, this._frame[3])
      this._frame = [];
    }

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    // 外枠
    const width = 100
    this._frame[0] = Bodies.rectangle(0, -width * 0, 9999, width, {isStatic:true});
    this._frame[1] = Bodies.rectangle(sw + width * 0 + 9999, 0, width, 9999, {isStatic:true}); // 最初引っかかるので今回はどけておく
    this._frame[2] = Bodies.rectangle(sw, sh + width * 0, 9999, width, {isStatic:true});
    this._frame[3] = Bodies.rectangle(-width * 0, 0, width, 9999, {isStatic:true});

    Composite.add(this.engine.world, [
      this._frame[0],
      this._frame[1],
      this._frame[2],
      this._frame[3],
    ])
  }


  protected _update(): void {
    super._update();
  }


  protected _resize(): void {
    super._resize();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    this.render.canvas.width = sw;
    this.render.canvas.height = sh;

    this._makeFrame();
  }
}