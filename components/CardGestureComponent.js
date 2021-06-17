/*
CardGestureComponent creates a draggable-droppable component
that has its coordinates relative to its parent
*/
import React, { Component } from 'react';
import {
    StyleSheet,
    Text, Dimensions,
    View, Animated,
    PanResponder,
} from 'react-native';
export default class CardGestureComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pan: new Animated.ValueXY(),//pan is a Vector, (x,y) = coordinates
            scale: new Animated.Value(1)
        };

        this.animatedValue = new Animated.ValueXY();
        this._value = {x: 0, y: 0};
        this.snapX = ('snapX' in this.props) ? this.props.snapX : 100;
        this.snapY = ('snapY' in this.props) ? this.props.snapY : 100;

        this.animatedValue.addListener((value) => {
            this._value = value
        });
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderGrant: (e, gestureState) => {
                this.animatedValue.setOffset({
                    x: this._value.x,
                    y: this._value.y,
                });
                this.animatedValue.setValue({ x: 0, y: 0})
            },
            onPanResponderMove: Animated.event([
                null, { dx: this.animatedValue.x, dy: this.animatedValue.y}
            ]),
            onPanResponderRelease: (e, gestureState) => {
                let {height, width} = Dimensions.get('window');
                let maxWidth = Math.floor(width/this.snapX) * this.snapX;
                let maxHeight = Math.floor(height/this.snapY) * this.snapY;
                let allowanceX = this._value.x % this.snapX;
                let allowanceY = this._value.y % this.snapY;

                let snappingX = Math.floor(this._value.x / this.snapX);
                let snappingY = Math.floor(this._value.y / this.snapY);

                // let snapPosX = snappingX + ((allowanceX > 8) ? 1 : 0);
                // let snapPosY = snappingY + ((allowanceY > 8) ? 1 : 0);
                let snapPosX = snappingX + ((allowanceX > 4) ? 1 : 0);
                let snapPosY = snappingY + ((allowanceY > 4) ? 1 : 0);

                snapPosX = (snapPosX < 0) ? 0 : snapPosX;
                snapPosY = (snapPosY < 0) ? 0 : snapPosY;

                this.animatedValue.setOffset({
                    x: (snapPosX * this.snapX < maxWidth) ? snapPosX * this.snapX : maxWidth,
                    y: (snapPosY * this.snapY < maxHeight ) ? snapPosY * this.snapY : maxHeight,
                });

                this.animatedValue.setValue({ x: 0, y: 0})

                // this.animatedValue.flattenOffset();

                /** callback */
                this.props.onMove(this._value);
            },
        })

        this.view = null;
    }

    render() {
        const animatedStyle = {
            transform: this.animatedValue.getTranslateTransform()
        }

        return (
            <Animated.View style={[styles.animatedView, animatedStyle]} {...this.panResponder.panHandlers}>
            { this.props.children }
                <Text>{JSON.stringify(this._value)}</Text>
            </Animated.View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 40
    },
    animatedView: {
        height: 100,
        width: 100,
        position: 'absolute',
        backgroundColor: 'lightblue',
    }
});