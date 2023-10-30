import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import Items from './components/items';

function App(): JSX.Element {
    const items: Item[] = [{ title: 'Freddo Espress', category: 'Coffee' }];

    return (
        <SafeAreaView>
            <Items items={items} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({});

export default App;
