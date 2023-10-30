import React from 'react';
import {
    View,
    Text,
    Button,
    ScrollView,
    StyleSheet,
    Dimensions,
    TouchableOpacity
} from 'react-native';

const windowWidth = Dimensions.get('window').width;

const Items = (items: Item[]) => {
    const renderKeys = () => {
        var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        // Split the array into pairs of 2 for two columns
        const pairs = [];
        for (let i = 0; i < arr.length; i += 2) {
            pairs.push(arr.slice(i, i + 2));
        }

        return pairs.map((pair, index) => (
            <View style={styles.row} key={index}>
                {pair.map((val) => (
                    <TouchableOpacity
                        style={styles.button}
                        key={val}
                        onPress={() => console.log('Button pressed!')}
                    >
                        <View style={styles.buttonContainer}>
                            <Text>{val}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        ));
    };

    return <ScrollView>{renderKeys()}</ScrollView>;
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: windowWidth
    },
    button: {
        width: '50%', // Adjust the width as needed
        height: 200,
        backgroundColor: 'green',
        activeOpacity: 1
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default Items;
