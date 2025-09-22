import { _decorator, Camera, Component, director, EventTouch, Input, input, instantiate, Node, resources, Scene, Sprite, SpriteFrame, sys, tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { FlowerMove } from './FlowerMove';
const { ccclass, property } = _decorator;

export enum FlowerName{
    FlowerLeft = "FlowerLeft",
    FlowerRight = "FlowerRight",
    FlowerMid = "FlowerMid",
}

@ccclass('FlowerPlatform')
export class FlowerPlatform extends Component {
    @property(UITransform)
    m_PlatFormUITrans:UITransform = null;
    @property(Node)
    m_FlowerPotRoot:Node = null;
    @property(Node)
    m_FlowerPotLayout:Node = null;

    m_RotationLeft:Vec3 = new Vec3(0, 0, 20);
    m_RotationRight:Vec3 = new Vec3(0, 0, -20);

    m_FlowerMoveRoot:Node = null;

    protected start(): void {        
        
    }

    protected onDestroy(): void {

    }

    public InitPlatForm(data:any, flowerMoveRoot:Node):void {
        this.m_FlowerMoveRoot = flowerMoveRoot;

        var cSize = this.m_PlatFormUITrans.contentSize;
        this.m_PlatFormUITrans.setContentSize(cSize.width*data.length, cSize.height);

        this.m_FlowerPotLayout.active = false;
        if(data){
            for(var i:number = 0;i < data.length; ++i){
                var flowerPotRootClone = instantiate(this.m_FlowerPotLayout);
                if(flowerPotRootClone){
                    var flowerRootBlack = flowerPotRootClone.getChildByName("FlowerRootBlack");
                    this.setFlowerData(flowerRootBlack, data[i]);
                    flowerRootBlack.active = false;

                    var flowerRootLight = flowerPotRootClone.getChildByName("FlowerRootLight");
                    this.setFlowerData(flowerRootLight, data[i]);
                    
                    flowerPotRootClone.active = true;
                    this.m_FlowerPotRoot.addChild(flowerPotRootClone);
                }
            }
        }
    }

    setFlowerData(flowerRoot:Node, data:any = null):void {
        if(flowerRoot == null){
            return;
        }

        flowerRoot.active = false;
        var left = flowerRoot.getChildByName("Left");
        if(data){
            left.active = true;
            this.setImg(left, data[0], -1);
        }
        else{
            left.active = false;
        }

        var mid = flowerRoot.getChildByName("Mid");
        if(data){
            mid.active = true;
            this.setImg(mid, data[1], 0);
        }
        else{
            mid.active = false;
        }

        var right = flowerRoot.getChildByName("Right");
        if(data){
            right.active = true;
            this.setImg(right, data[2], 1);
        }
        else{
            right.active = false;
        }

        flowerRoot.active = true;      
    }

    //imgPos: 0-中间 1-右边 -1-左边
    setImg(root:Node, imgId:string, imgPos:number){
        if(imgId == null || imgId == undefined){
            return;
        }

        var img = null;
        if(root == null || root == undefined){
            return;
        }

        root.removeAllChildren();
        var imgNode = new Node();
        if(imgNode){      
            imgNode.name = "FlowerImgMid";
            if(imgPos == -1){
                imgNode.name = "FlowerImgLeft";
                imgNode.setRotationFromEuler(this.m_RotationLeft);
            }
            else if(imgPos == 1){
                imgNode.name = "FlowerImgRight";
                imgNode.setRotationFromEuler(this.m_RotationRight);
            }

            var moveScript = imgNode.addComponent(FlowerMove);   
            if(moveScript){
                moveScript.init(root, this.m_FlowerMoveRoot, imgPos, this.m_RotationLeft, this.m_RotationRight);
            }  

            imgNode.active = false;                
            
            var uiTrans = imgNode.getComponent(UITransform);
            if(uiTrans == null || uiTrans == undefined){
                uiTrans = imgNode.addComponent(UITransform)
            }

            if(uiTrans){
                uiTrans.setAnchorPoint(0.5, 0);
            }

            img = imgNode.addComponent(Sprite);
            if(img){
                if(imgId != ""){
                    resources.load("flowers/" + imgId + "/spriteFrame", SpriteFrame, (err, sp)=>{
                        if(sp){
                            img.spriteFrame = sp;
                        }
                        imgNode.active = true;
                    });
                }
            }

            root.addChild(imgNode);
        }
    }
}


