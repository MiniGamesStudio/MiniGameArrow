import { __private, _decorator, Button, Component, instantiate, Layout, Node, PageView, Prefab, ProgressBar, resources, Slider, SpriteFrame, UITransform } from 'cc';
import { UIBase } from '../Core/UIBase';
import { UIManager } from '../Core/UIManager';
import { UIID } from './UIData';
import { FlowerPlatform } from './FlowerPlatform';
import { FlowerConfig } from '../Config/Config';
const { ccclass, property } = _decorator;

@ccclass('GamePanel')
export class GamePanel extends UIBase {
    @property(Button)
    m_CloseBtn:Button = null;
    @property(Node)
    m_LevelRoot:Node = null;
    @property(Node)
    m_FlowerImgMoveRoot:Node = null;

    onOpen(...args: any[]): void {
        this.initUI();
    }

    onClose(): void {
        
    }

    initUI(): void {
        this.m_CloseBtn.node.on('click', ()=>{
            UIManager.GetInstance().ClosePanel(UIID.GamePanel);
            UIManager.GetInstance().OpenPanel(UIID.MainPanel);
        });

        var gameData:object[] = [   
            [
                [
                    FlowerConfig.Flower01,
                    FlowerConfig.Flower01,
                    FlowerConfig.Flower02,
                ]
            ],     
            [
                [
                    FlowerConfig.Flower02,
                    FlowerConfig.Flower03,
                    FlowerConfig.Flower05,
                ],
                [
                    FlowerConfig.Flower02,
                    FlowerConfig.Flower01,
                    FlowerConfig.Flower07,
                ],
            ],  
            [
                [
                    FlowerConfig.Flower01,
                    FlowerConfig.Flower01,
                    FlowerConfig.Flower08,
                ],
                [
                    FlowerConfig.Flower04,
                    FlowerConfig.Flower05,
                    FlowerConfig.Flower05,
                ],
                [                
                    FlowerConfig.Flower07,
                    FlowerConfig.Flower02,
                    FlowerConfig.Flower03,
                ]
            ],  
            [
                [
                    FlowerConfig.Flower04,
                    FlowerConfig.Flower05,
                    FlowerConfig.Flower06,
                ],
                [
                    FlowerConfig.Flower08,
                    FlowerConfig.Flower05,
                    FlowerConfig.Flower06,
                ],
                [                
                    FlowerConfig.Flower03,
                    FlowerConfig.Flower06,
                    FlowerConfig.Flower06,
                ],
                [                
                    FlowerConfig.Flower07,
                    FlowerConfig.Flower07,
                    FlowerConfig.Flower08,
                ]
            ]
        ];

        resources.load("ui/FlowerPlatform", Prefab, (err, prefab)=>{
            if(prefab){
                for(var i:number = 0; i < gameData.length; ++i){
                    var temp = instantiate(prefab);
                    if(temp){
                        this.m_LevelRoot.addChild(temp);
                        var tScript = temp.getComponent(FlowerPlatform);
                        if(tScript){
                            tScript.InitPlatForm(gameData[i], this.m_FlowerImgMoveRoot);                            
                        }
                    }
                }
            }
        });
    }
}