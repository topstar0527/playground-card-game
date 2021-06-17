import React, {Component} from 'react';
import {
    Platform,
    Alert,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ScrollView,
    Switch,
    Button,
} from 'react-native';
import {card_types, capitalizeFirstLetter} from './Data';

export default class Card extends Component<Props> {
    constructor(props){
        super(props)
        this.state = {
            attributes : {}
        }
        this.attributes = this.props.attributes;
        this.card_background = [`#DEBC7B`,`#B2C8ED`,`#AEA396`,`#AB9A87`,`#93CEA8`,]
    }

    componentDidMount(){
    }

    getCardAttributes()
    {
        return this.attributes;
    }

    getCardAbilities(abilities)
    {
        return abilities.map((ability, key) =>
            (<Text key={key} >{ capitalizeFirstLetter(ability.text) +" ("+ ability.value +")" }</Text>)
        );
    }

    render() {
        let self = this;
        let attributes = self.getCardAttributes();
        return (
            <View
                style={[
                    {
                        borderWidth: 1,
                        height: 350/3,
                        width: 250/3,
                        backgroundColor: self.card_background[ parseInt(attributes.type) ],
                        borderRadius : 10,
                    },
                ]}
            >
                <Text style={[{color:"#0091EA"}]}>{ attributes.cost }</Text>
                <View style={{paddingHorizontal:10}}>
                    <Text >{ attributes.name }</Text>
                    {
                        (attributes.type != 1) ? null : self.getCardAbilities(attributes.abilities)
                    }
                    {/* <Text>{ capitalizeFirstLetter( card_types[ parseInt(attributes.type) ] ) }</Text> */}
                </View>
                {
                    (attributes.type != 0) ? null :
                    (
                        <View style={{flexDirection:`row`,justifyContent:`space-between`}}>
                            <Text style={[{color:"#B71C1C"}]}>{ attributes.power }</Text>
                            <Text style={[{color:"#1B5E20"}]}>{ attributes.health }</Text>
                        </View>
                    )
                }
            </View>
        )
    }
}