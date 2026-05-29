import { FlatList, Text, View } from "react-native";

const button = [
    {id:1, title: "первая", role:"дизайн1"},
    {id:2, title: "2", role:"дизайн2"},
    {id:3, title: "3", role:"дизайн3"},
    {id:4, title: "4", role:"дизайн4"},
]

const List = () => {
    return (
        <FlatList
            data={button}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View>
                    <Text>{item.id}</Text>
                    <Text>{item.title}</Text>
                    <Text>{item.role}</Text>
                </View>
            )}
        />
    );
}

export default List;