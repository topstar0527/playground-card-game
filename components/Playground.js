import React, {Component} from 'react';
import {
    Platform,
    Alert,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Button,
    UIManager,
    findNodeHandle,
} from 'react-native';
import {adj, noun, card_types, capitalizeFirstLetter, } from './Data';
import Dialog from "react-native-dialog";
import Card from './Card';
import CardGestureComponent from './CardGestureComponent';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
    android:
        'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
    });
const adj_count = adj.length;
const noun_count = noun.length;
const game_phases = ["Game Start","Draw","Attack","Turn End"];
const random_abilities = ["addMana","drawCards", "discardCards", "millCards",]
class CardObj{
    constructor(props){
        this.name = capitalizeFirstLetter( adj[ Math.floor( Math.random() * adj_count ) ] ) +" "+ capitalizeFirstLetter( noun[ Math.floor( Math.random() * noun_count ) ] );
        this.type = Math.floor(Math.random() * 3);
        this.tooltip_visible = false;
        this.cost = Math.floor(Math.random()*3) + 1;
        this.health = (this.type != 0) ? null : Math.floor(Math.random()*2) + 1;
        this.power = (this.type != 0) ? null : Math.floor(Math.random()*2);

        /** ability_obj */
        let abilities = [];
        let ability_obj = {
            text: random_abilities[Math.floor(Math.random()*3)],
            value : Math.floor(Math.random()*3) + 1,
        }
        abilities.push(ability_obj);

        this.abilities = abilities;
        this.status = true;
    }
}

/** turn-based, action count, unlimited zone, has combat phase, interactive, each card is a resource */
class Playground extends Component<Props> {
    constructor(props){
        super(props);
        this.deck = [];
        this.generateDeck = this.generateDeck.bind(this);
        this.getDeck = this.getDeck.bind(this);
        this.drawCards = this.drawCards.bind(this);
        this.discardCards = this.discardCards.bind(this);
        this.millCards = this.millCards.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.addMana = this.addMana.bind(this);
        this.max_mana = 10;
        this.card_width = 250;
        this.card_height = 350;

        this.state={
            deck_ready : false,
            hand: [],
            discard_pile: [],
            playfield: [],
            resources: [],
            card_details : null,
            card_details_dialog_visible: false,
            deck_dialog_visible: false,
            discard_pile_dialog_visible: false,
            game_phase: 0,
            registered_abilities: {
                upkeep: [],
                draw: [],
            },
            mana:0,
            action_count: 3,
            playfield_layout: {},
        }
    }

    componentDidMount(){
        let self = this;
        self.generateDeck();
    }

    /** run if state.game_phase is updated */
    checkPhase(){

    }

    registerAbilitiy(ability_obj){

    }

    unregisterAbilitiy(ability_obj){

    }

    async generateDeck(){
        let deck = [];
        let card_limit = 40;

        for(let itr = 1; itr <= card_limit; itr++)
        {
            let tmp_crd = new CardObj();
            deck.push(tmp_crd);

            if(itr == card_limit)
            {
                this.setState({
                    deck_ready : true
                })

                this.deck = deck;
            }
        }
    }

    getDeck() {
        return this.deck;
    }

    async mulligan(){
        this.deck = [];
        await this.setState({
            hand : [],
            discard_pile : [],
        });
        await this.generateDeck();
        this.drawCards(5);
    }

    drawCards(card_count)
    {
        let self = this;
        let currDeck = self.deck;
        let currHand = self.state.hand;
        let tmp_cards = [];
        if(currDeck.length > 0)
        {
            for(let itr = 1; itr <= card_count; itr++)
            {
                let tmp_card = currDeck.shift();
                tmp_cards.push(tmp_card);
            }
            self.deck = currDeck;
            currHand = currHand.concat(tmp_cards);
            self.setState({
                hand : []
            }, ()=>{
                self.setState({
                    hand : currHand
                });
            });
        }
    }

    discardCards(discard_count = 1, card_index, card_obj)
    {
        let self = this;
        let currHand = self.state.hand;
        let currDiscard_pile = self.state.discard_pile;
        let remainingCards = [];

        if(typeof card_obj == 'undefined')
        {
            let discard_index = (card_index != null) ? card_index : Math.floor(Math.random() * currHand.length) /** discard a card at random */;
            currHand.map((currCard, index) => {
                if(index == discard_index)
                {
                    currCard.status = false;
                    currDiscard_pile.unshift(currCard);
                }
            });

            remainingCards = currHand.filter((currCard, index) => {
                if(index != discard_index)
                    return currCard
            });
        }
        else
        {
            remainingCards = currHand;
            card_obj.status = false;
            currDiscard_pile.unshift(card_obj);
        }

        self.setState({
            hand : [],
            discard_pile : [],
        }, () => {
            self.setState({
                hand : remainingCards,
                discard_pile : currDiscard_pile,
            });
        });
    }

    millCards(card_count)
    {
        let self = this;
        let currDeck = self.deck;
        let currDiscard_pile = self.state.discard_pile;
        for(let itr = 1; itr <= card_count; itr++)
        {
            let tmp_card = currDeck.shift();
            tmp_card.status = false;
            currDiscard_pile.unshift(tmp_card);
        }
        self.deck = currDeck;

        self.setState({
            discard_pile : [],
        }, () => {
            self.setState({
                discard_pile : currDiscard_pile,
            });
        });
    }

    addMana(mana_count){
        let self = this;
        let currentMana = self.state.mana + mana_count;
        let currHand = self.state.hand;
        currentMana = (currentMana < self.max_mana) ? currentMana : self.max_mana;

        self.setState({
            mana : [],
            hand : [],
        }, () =>{
            self.setState({
                mana : currentMana,
                hand : currHand,
            });
        });
    }

    playCard(card_index)
    {
        let self = this;
        let currHand = self.state.hand;
        let currPlayfield = self.state.playfield;
        let playedCards = currHand.filter((currCard, index) => (index == card_index) );
        const playedCard = playedCards[0];

        /** reset flags */
        playedCard.tooltip_visible = false;

        currPlayfield.unshift(playedCard);

        let remainingCards = currHand.filter((currCard, index) => {
            if(index != card_index)
                return currCard
        });

        let currMana = self.state.mana - playedCard.cost;
        self.setState({
            hand : [],
            playfield : [],
        }, () => {
            self.setState({
                hand : remainingCards,
                mana : currMana,
                playfield : currPlayfield, /** put card into playfield */
            }, ()=>{
                /** when a card is played:
                 * 1) register its abilities to the respective phases (if any) that it will affect
                 * 2) when a phase starts, run the abilities one by one
                 */
                /** if cards is an event, use its event then discard it */
                if(playedCard.type == 1)
                {
                    /** play card ability */
                    for(let itr in playedCard.abilities)
                    {
                        let ability = playedCard.abilities[itr];
                        self[ ability.text ]( ability.value );
                    }

                    currPlayfield[0].status = false;
                }

                let newPlayfield = currPlayfield;
                setTimeout(function(){
                    self.setState({
                        playfield : newPlayfield,
                    }, () => {
                        self.cleanPlayfield();
                    });
                }, 1000);
            });
        });
    }

    cleanPlayfield(){
        let self = this;
        let currPlayfield = self.state.playfield;
        let discarded_cards = currPlayfield.filter((currCard) =>(currCard.status == false));
        let active_cards = currPlayfield.filter((currCard) =>(currCard.status == true));
        discarded_cards.map((currCard) =>{
            self.discardCards(null, null, currCard);
        })

        self.setState({
            playfield : [],
        }, () => {
            self.setState({
                playfield : active_cards,
            });
        });
    }

    showTooltip(zone, card_index){
        let self = this;
        let game_phases = ["","draw","play","pass"];

        if(self.state.game_phase == game_phases.indexOf("play"))
        {
            let card_pile = self.state[ zone ].map((currCard) => {
                currCard.tooltip_visible = false;
                return currCard;
            });
            let card_pile_state = {};
            card_pile_state[ zone ] = card_pile;

            self.setState(card_pile_state, () => {
                let new_card_pile = self.state[ zone ].map((currCard, index) => {
                    if(index == card_index)
                    {
                        currCard.tooltip_visible = true;
                    }
                    return currCard;
                });

                let new_card_pile_obj = {};
                new_card_pile_obj[ zone ] = new_card_pile;

                self.setState(new_card_pile_obj);
            });
        }
    }

    getHand(){
        return this.state.hand;
    }

    getDiscardPile(){
        return this.state.discard_pile;
    }

    getPlayfield(){
        return this.state.playfield;
    }

    getCurrentMana(){
        return this.state.mana;
    }

    getActionCount(){
        return this.state.action_count;
    }

    render() {
        let self = this
        let deck = (self.state.deck_ready) ? self.getDeck() : [];
        let hand = self.getHand();
        let discard_pile = self.getDiscardPile();
        let playfield = self.getPlayfield();
        let currentMana = self.getCurrentMana();
        let action_count = self.getActionCount();
        let hand_ready = (hand.length == 0);
        let {height, width} = Dimensions.get('window');
        let card_left_margin = 0;
        let total_hand_width = hand.length * (self.card_width/3);
        if(total_hand_width > width)
        {
            card_left_margin = (width - total_hand_width) / hand.length;
        }

        let game_phases = ["","draw","play","pass"]

        return (
            <View style={{backgroundColor:`#607D8B`, flex:1, flexDirection:`column`}}>
                <View style={{width:`100%`}}>
                    {
                        (self.state.game_phase == 0) ? (
                            <View style={{flexDirection:`row`, alignContent:`stretch`, justifyContent:`space-between`}}>
                                <Button style={{flex:1}} onPress={ () => self.mulligan() } title={ (hand.length == 0) ? `Draw 5` : 'Redraw 5'} />
                                <Button style={{flex:2}} onPress={ () => self.setState({ game_phase:1 }) } disabled={ hand_ready } title={ 'OK' } />
                            </View>
                        ) : (
                            <View style={{flexDirection:`row`, alignContent:`stretch`, justifyContent:`space-between`}}>
                                <Button style={{flex:1}}
                                    onPress={ () => {
                                        self.addMana(1);
                                        self.drawCards(1);
                                        self.setState({ game_phase : 2}) /** move to Play Phase */
                                    } }
                                    title={`Draw 1`}
                                    disabled={ (self.state.game_phase != game_phases.indexOf("draw")) } />
                                <Button style={{flex:1}}
                                    onPress={ () => {
                                        self.setState({ game_phase : 3}) /** move to Pass Phase */
                                    } }
                                    title={`Done`}
                                    disabled={ (self.state.game_phase != game_phases.indexOf("play")) } />
                                <Button style={{flex:1}}
                                    onPress={ () => {
                                        self.setState({ game_phase : 1}) /** move to Draw Phase */
                                    } }
                                    title={`Pass Turn`}
                                    disabled={ (self.state.game_phase != game_phases.indexOf("pass")) } />
                                <Button style={{flex:1}} onPress={ () => self.addMana(1) } title={`Add 1 Mana`} />
                            </View>
                        )
                    }
                </View>
                {/** DECK/DISCARD PILE ZONE */}
                <View
                    style={{
                        flexDirection:`row`,
                        // height: self.card_height/2,
                        justifyContent:`space-around`,
                        marginVertical: 20,
                    }}>
                    <Text style={{
                        textAlign:'center',
                        fontWeight: `bold`
                    }}>Deck ({deck.length})</Text>

                    <Text style={{
                        textAlign:'center',
                        fontWeight: `bold`
                    }}>Mana ({ self.state.mana })</Text>

                    <TouchableOpacity
                        onPress={()=>{
                            self.setState({
                                discard_pile_dialog_visible : true,
                            })
                        }}
                        style={{
                            borderBottomWeight: 1,
                        }}>
                        <Text style={{
                            textAlign:'center',
                            fontWeight: `bold`,
                        }}>Discard Pile ({ discard_pile.length })</Text>
                    </TouchableOpacity>
                </View>

                {/** PLAYFIELD ZONE */}
                <View
                    style={{
                        flexDirection:`row`,
                        height: self.card_height/3,
                        justifyContent:`space-around`,
                        marginBottom: 20,
                    }}
                    onLayout={({ nativeEvent}) => {
                        self.setState({
                            playfield_layout: nativeEvent.layout
                        })
                    }}
                    >
                    <ScrollView
                        style={{
                            width: self.card_width/3,
                            height: self.card_height/3,
                            backgroundColor:`#00BFA5`,
                        }}
                        horizontal={true}
                    >
                        {
                            (playfield.length > 0) ? playfield.map((item, index) => {
                                return <View key={index}>
                                        <TouchableOpacity
                                            style={[
                                            ]}
                                        >
                                            <Card attributes={{...item}} width={ self.card_width } height={ self.card_height }/>
                                        </TouchableOpacity>
                                    </View>;
                            }) : null
                        }
                    </ScrollView>
                </View>

                {/** PLAYER HAND */}
                <ScrollView
                    style={{flex:3}}
                    horizontal={true}
                >
                    {
                        (hand.length > 0) ? hand.map((item, index) => {
                            let tooltip_height = 80;
                            return (
                                <View
                                    style={{
                                        marginLeft: (index == 0) ? 0 : card_left_margin,
                                        overflow: `visible`,
                                    }}
                                    key={index}
                                    >
                                    {
                                        /** Card Tooltip */
                                        ( item.tooltip_visible ) ? (
                                            <View style={{
                                                width:`100%`,
                                                height: tooltip_height,
                                                padding: 5,
                                                position:`absolute`,
                                                paddingHorizontal: 10,
                                                borderRadius: 5,
                                                backgroundColor:'rgba(0,0,0,0.25)',
                                            }} >
                                            {
                                                (action_count != 0 && currentMana < item.cost) ? null : (
                                                    <TouchableOpacity onPress={()=>{
                                                        self.playCard( index );
                                                    }}>
                                                        <Text
                                                            style={[{fontWeight:`bold`, color:`#fff`}]}
                                                        >Play</Text>
                                                    </TouchableOpacity>
                                                )
                                            }
                                            {
                                                (action_count == 0) ? null : (
                                                    <TouchableOpacity onPress={()=>{
                                                        self.playCard( index );
                                                    }}>
                                                        <Text
                                                            style={[{fontWeight:`bold`, color:`#fff`}]}
                                                        >Play as Resource</Text>
                                                    </TouchableOpacity>
                                                )
                                            }
                                                <TouchableOpacity
                                                    onPress={()=>{
                                                        self.discardCards( 1, index );
                                                    }}>
                                                    <Text
                                                        style={[{fontWeight:`bold`, color:`#fff`}]}
                                                    >Discard</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : null
                                    }
                                    <TouchableOpacity
                                        onPress={()=> {self.showTooltip("hand", index)} }
                                        onLongPress={()=>{
                                            self.setState({
                                                card_details_dialog_visible : true,
                                                card_details: item
                                            })
                                        }}
                                        style={[
                                            {
                                                marginTop: tooltip_height,
                                                opacity: (currentMana >= item.cost) ? 1 : 0.661,
                                            },
                                            (self.state.tooltip_expanded == false) ? {position:`absolute`} : null,
                                        ]}
                                    >
                                        <Card attributes={{...item}} width={ self.card_width } height={ self.card_height }/>
                                    </TouchableOpacity>
                                </View>
                                );
                        }) : null
                    }
                </ScrollView>
                <CardGestureComponent onMove={(relativeCoordinates) => {
                        // alert(JSON.stringify(relativeCoordinates));
                    }}>
                        <Text>Drag me</Text>
                    </CardGestureComponent>
                <Dialog.Container
                    visible={self.state.card_details_dialog_visible}
                    contentStyle={{ overflow:'visible', height:( height * .75)}}
                >
                    <Text>{ (self.state.card_details == null) ? "" : self.state.card_details.name }</Text>
                    <Text>{ (self.state.card_details == null) ? "" : capitalizeFirstLetter( card_types[ parseInt( self.state.card_details.type ) ] )  }</Text>
                    <TouchableOpacity onPress={()=>{
                        self.setState({
                            card_details_dialog_visible : false,
                            card_details: null,
                        })
                    }}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                </Dialog.Container>

                <Dialog.Container
                    visible={self.state.discard_pile_dialog_visible}
                    contentStyle={{ overflow:'visible', height:( height * .75)}}
                >
                    <ScrollView>
                        <Text style={{
                            textAlign:'center',
                            width:`100%`,
                        }}>Discard Pile ({discard_pile.length})</Text>
                        {
                            (discard_pile.length > 0) ? discard_pile.map((item, index) => {
                                return <View key={index}>
                                        <TouchableOpacity
                                            style={[
                                            {
                                                opacity:0.5
                                            },
                                            ]}
                                        >
                                            <Card attributes={{...item}} width={ self.card_width } height={ self.card_height }/>
                                        </TouchableOpacity>
                                    </View>;
                            }) : null
                        }
                    </ScrollView>
                    <TouchableOpacity onPress={()=>{
                        self.setState({
                            discard_pile_dialog_visible : false,
                        })
                    }}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                </Dialog.Container>
            </View>
        );
    }
}

export default Playground;