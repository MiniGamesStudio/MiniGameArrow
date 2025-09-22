import { _decorator, Component, EventTouch, Node, tween, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FlowerMove')
export class FlowerMove extends Component {
    m_FlowerFlySpeed:number = 1000;
    m_FlowerStartPos:Vec3 = Vec3.ZERO;
    m_RotationLeft:Vec3 = Vec3.ZERO;
    m_RotationRight:Vec3 = Vec3.ZERO;

    m_FlowerRoot:Node = null;
    m_FlowerMoveRoot:Node = null;
    m_FlowerMoveRootUIT:UITransform = null;
    m_FlowerMoveOffsetY:number = 0;
    m_IsDragingFlower:Boolean = false;
    m_ImgPos:number = 0;

    //imgPos: 0-中间 1-右边 -1-左边
    init(flowerRoot : Node, flowerMoveRoot : Node, imgPos:number, rLeft:Vec3, rRight:Vec3){
        this.m_IsDragingFlower = false;
        this.m_FlowerRoot = flowerRoot;
        this.m_FlowerMoveRoot = flowerMoveRoot;
        if(this.m_FlowerMoveRoot){
            this.m_FlowerMoveRootUIT = this.m_FlowerMoveRoot.getComponent(UITransform);
        }
        this.m_ImgPos = imgPos;
        this.m_RotationLeft = rLeft;
        this.m_RotationRight = rRight;
    }

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this, true);
    }

    protected onDestroy(): void {        
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onTouchStart(event: EventTouch){
        if(this.m_IsDragingFlower){
            return;
        }

        if(event.target){
            this.m_IsDragingFlower = true;                    
            this.m_FlowerMoveOffsetY = event.target.getComponent(UITransform).contentSize.height * 0.6;
            event.target.parent = this.m_FlowerMoveRoot;     
            this.m_FlowerStartPos = this.m_FlowerRoot.getWorldPosition(); 
            var touchPos = event.touch.getUILocation();             
            var flowerStartPos = this.m_FlowerMoveRootUIT.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            event.target.setPosition(flowerStartPos.x, flowerStartPos.y - this.m_FlowerMoveOffsetY);
            event.target.setRotationFromEuler(new Vec3(0, 0, 0));
        }
    }

    onTouchMove(event: EventTouch){
        if(!this.m_IsDragingFlower){
            return;
        }

        if(event.target){
            const delta = event.getUIDelta();
            
            // 移动花朵节点
            const pos = event.target.position;
            event.target.setPosition(pos.x + delta.x, pos.y + delta.y);
        }
    }

    onTouchEnd(event: EventTouch){
        if(!this.m_IsDragingFlower){
            return;
        }

        if(event.target){                
            var flowerEndPos = event.target.getWorldPosition();

            var temp = Math.abs(this.m_FlowerStartPos.x - flowerEndPos.x) + Math.abs(this.m_FlowerStartPos.y - flowerEndPos.y);
            this.m_FlowerStartPos.subtract(flowerEndPos);
            tween(event.target).by(temp/this.m_FlowerFlySpeed, {position : this.m_FlowerStartPos}).call(()=>{
                this.m_IsDragingFlower = false;
                this.node.setRotationFromEuler(Vec3.ZERO);
                if(this.m_ImgPos == -1){
                    this.node.setRotationFromEuler(this.m_RotationLeft);
                }
                else if(this.m_ImgPos == 1){
                    this.node.setRotationFromEuler(this.m_RotationRight);
                }

                this.node.parent = this.m_FlowerRoot;
                this.node.setPosition(Vec3.ZERO);
            }).start();
        }
        else{            
            this.m_IsDragingFlower = false;
        }   
    }

    onTouchCancel(event: EventTouch){
        this.onTouchEnd(event);
    }
}


