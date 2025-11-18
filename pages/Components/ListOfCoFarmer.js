import { StyleSheet, Text, View, FlatList, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { axiosGet } from '../utils/api'
import { ROUTES } from '../utils/Routes'
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ListOfCoFarmer = ({
    dbname, lan_id, token, user_id, farmeruserID, plotId, isLoading, setIsLoading
}) => {
    const [coFarmerList, setCoFarmerList] = useState([])
    useEffect(() => {
        const onPageload = async () => {
            setIsLoading(true)
            try {
                const response = await axiosGet(ROUTES.GET.LIST_CO_FARMERS({ land_fid: plotId }), token, {
                    information: `${dbname},${lan_id},${user_id}`
                    // `${dbname},${lan_id},${farmeruserID}`,
                });
                if (response?.status == 200) {
                    setCoFarmerList(response?.data?.data?.rows)
                }
            } catch (error) {
                setIsLoading(false)
                console.error(error)
            } finally {
                setIsLoading(false)
            }
            setIsLoading(false)
        }
        onPageload();

    }, [])
    return (
        isLoading ? (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2ecc71" />
            </View>
        ) : (
            <FlatList
                data={coFarmerList}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ borderRadius: 16,backgroundColor: '#faf9f9ff',padding:10 }}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>Co-Farmers</Text>
                        <Text style={styles.headerCount}>Total: {coFarmerList.length}</Text>
                    </View>
                }
                renderItem={({ item, index }) => {
                    const isLast = index === coFarmerList.length - 1;

                    return (
                        <View style={[
                            styles.card,
                            !isLast && styles.cardBorder   // apply border except last
                        ]}>
                            <View style={styles.leftBorder} />
                            <View style={styles.content}>
                                <Text style={styles.name}>{item?.coFInfo?.userName}</Text>
                                <Text style={styles.details}>{item?.coFInfo?.contactNumber}</Text>
                            </View>
                        </View>
                    );
                }}

                ListEmptyComponent={
                    <Text style={styles.emptyText}>No Co-Farmers added yet</Text>
                }
                showsVerticalScrollIndicator={false}
            />
        )

    )
}
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        // borderRadius: 12,
        // marginVertical: 6,
        // marginHorizontal: 10,
        shadowColor: '#000',
        // shadowOpacity: 0.1,
        // shadowOffset: { width: 0, height: 1 },
        // shadowRadius: 2,
        // elevation: 2
    },
    leftBorder: {
        // width: 6,
        // backgroundColor: '#2ecc71', // eye-catching green
        // borderTopLeftRadius: 12,
        // borderBottomLeftRadius: 12,
    },
    content: {
        flex: 1,
        padding: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    details: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
    },
    cardBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20
    },
    headerContainer: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#f7f7f7',
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 5
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2ecc71',
    },
    headerCount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
        marginTop: 2,
    }


});

export default ListOfCoFarmer
