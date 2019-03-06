//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {



    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })



    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        this.startAnimation(result);
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private textfield: egret.TextField;
    private level: number;
    private cube: egret.Sprite;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        this.level = 1;


        // this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this);

        this.cube = new egret.Sprite();

        this.addChild(this.cube);

        this.updateView();

    }

    public xGetRandom(nMin, nMax) {
        var ret: number = Math.floor(Math.random() * (nMax - nMin + 1)) + nMin;
        return ret;
    }


    private updateView() {
        this.clearCube();
        var suqare: egret.Shape;
        let col = this.xGetRandom(0, this.level);
        let row = this.xGetRandom(0, this.level);
        let gridWidth = 600 / (this.level + 1);
        for (let i = 0; i < this.level + 1; i++) {
            for (let j = 0; j < this.level + 1; j++) {
                if (i === col && j === row) {
                    suqare = new egret.Shape();
                    suqare.graphics.beginFill(Colors.colors[0]);
                    suqare.graphics.drawRect(20 + i * gridWidth + 3, 20 + j * gridWidth + 3, gridWidth - 3, gridWidth - 3);
                    suqare.graphics.endFill();
                    suqare.touchEnabled = true;
                    this.cube.addChild(suqare);
                    suqare.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this);
                } else {
                    suqare = new egret.Shape();
                    suqare.graphics.beginFill(Colors.colors[1]);
                    suqare.graphics.drawRect(20 + i * gridWidth + 3, 20 + j * gridWidth + 3, gridWidth - 3, gridWidth - 3);
                    suqare.graphics.endFill();
                    suqare.touchEnabled = false;
                    this.cube.addChild(suqare);
                }
            }
        }
    }

    private clearCube() {
        this.cube.removeChildren();
    }

    private onClick(e: egret.TouchEvent) {
        var suqare: egret.Shape = e.target as egret.Shape;
        this.level++;
        this.updateView();
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: string[]) {
        let parser = new egret.HtmlTextParser();

        let textflowArr = result.map(text => parser.parse(text));
        let textfield = this.textfield;
        let count = -1;
        let change = () => {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            let textFlow = textflowArr[count];

            // 切换描述内容
            // Switch to described content
            textfield.textFlow = textFlow;
            let tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, this);
        };

        change();
    }
}