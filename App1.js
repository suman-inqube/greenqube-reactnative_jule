import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';

const data = [
    { id: 1, name: 'John', course: 'Math' },
    { id: 2, name: 'Alice', course: 'Science' },
    { id: 3, name: 'Bob', course: 'History' },
    { id: 4, name: 'Eve', course: 'English' },
    // Add more data items as needed
];

const App = () => {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedName, setSelectedName] = useState('');

    const handleSearch = (text) => {
        setSearchText(text);

        // Filter data based on the "like" or "contains" search in the 'name' column
        const filteredItems = data.filter(item =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );

        setSearchResults(filteredItems);
    };

    const handleResultSelect = (name) => {
        setSelectedName(name);
        setSearchText(name); // Set the selected name in the TextInput
        setSearchResults([]); // Clear search results
    };

    return (
        <View>
            <TextInput
                placeholder="Search by name..."
                value={searchText}
                onChangeText={(text) => handleSearch(text)}
            />

            <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleResultSelect(item.name)}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
            />

            <Text>Selected Name: {selectedName}</Text>
        </View>
    );
};

export default App;
