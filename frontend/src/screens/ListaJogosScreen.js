import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, Alert, StyleSheet, ActivityIndicator} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarJogos, excluirJogo } from '../api/jogosApi';
import { colors } from '../theme';

export default function ListaJogosScreen({ navigation }) {
    const [jogos, setJogos] = useState([]);
    const [buscar, setBuscar] = useState('');
    const [termo, setTermo] = useState('');
    const [ordem, setOrdem] = useState('titulo');
    const [dir, setDir] = useState('asc');
    const [carregando, setCarregando] = useState(false);

    const carregarDados = async () => {
        setCarregando(true);
        try {
            const dados = await listarJogos({ buscar: termo, ordem, dir });
            setJogos(dados);
        } catch (err) {
            Alert.alert('Erro', err.data?.erro || 'Falha ao carregar jogos.');
        } finally {
            setCarregando(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [termo, ordem, dir])
    );

    const pesquisar = () => setTermo(buscar.trim());
    
    const alternarOrdenacao = (campo) => {
        const novaDir = ordem === campo && dir === 'asc' ? 'desc' : 'asc';
        setOrdem(campo);
        setDir(novaDir);
    };

    const confirmarExclusao = (jogo) => {
        Alert.alert(
            'Excluir Jogo',
            `Deseja realmente remover "${jogo.titulo}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await excluirJogo(jogo.id);
                            Alert.alert('Sucesso', 'Jogo excluído com sucesso!');
                            carregarDados();
                        } catch (err) {
                            Alert.alert('Erro', err.data?.erro || 'Não foi possível excluir o jogo.');
                        }
                    },
                },
            ]
        );
    };

    const formatarPreco = (valor) =>
        `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
    
    const formatarData = (iso) => {
        const [ano, mes, dia] = iso.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {item.urlCapa ? (
                <Image source={{ uri: item.urlCapa }} style={styles.capa} />
            ) : (
                <View style={styles.capa} />
            )}
            <View style={styles.info}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.genero}>{item.genero}</Text>
                <Text style={styles.preco}>{formatarPreco(item.preco)}</Text>
                {item.dataLancamento ? (
                    <Text style={styles.data}>Lançamento: {formatarData(item.dataLancamento)}</Text>
                ) : null}
            </View>
            <View style={styles.acoes}>
                <TouchableOpacity
                    style={[styles.btnAcao, { borderColor: colors.warning }]}
                    onPress={() => navigation.navigate('FormJogo', { jogo: item })}
                >
                    <Text style={{ color: colors.warning, fontWeight: 'bold' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btnAcao, { borderColor: colors.danger }]}
                    onPress={() => confirmarExclusao(item)}
                >
                    <Text style={{ color: colors.danger, fontWeight: 'bold' }}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Barra de Pesquisa + Botão Novo */}
            <View style={styles.topBar}>
                <TextInput
                    style={styles.inputBusca}
                    placeholder="Pesquisar por título..."
                    placeholderTextColor={colors.textMuted}
                    value={buscar}
                    onChangeText={setBuscar}
                    onSubmitEditing={pesquisar}
                />
                <TouchableOpacity style={styles.btnBuscar} onPress={pesquisar}>
                    <Text style={styles.btnTexto}>Buscar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.btnNovo}
                    onPress={() => navigation.navigate('FormJogo', { jogo: null })}
                >
                    <Text style={styles.btnTexto}>+ Novo</Text>
                </TouchableOpacity>
            </View>

            {/* Controles de Ordenação */}
            <View style={styles.ordenacaoBar}>
                <Text style={styles.ordenarLabel}>Ordenar por:</Text>
                {['titulo', 'preco', 'dataLancamento'].map((campo) => {
                    const ativo = ordem === campo;
                    const label = campo === 'dataLancamento' ? 'Data' : campo === 'preco' ? 'Preço' : 'Título';
                    return (
                        <TouchableOpacity
                            key={campo}
                            style={[styles.btnOrdem, ativo && styles.btnOrdemAtivo]}
                            onPress={() => alternarOrdenacao(campo)}
                        >
                            <Text style={styles.btnOrdemTexto}>
                                {label} {ativo ? (dir === 'asc' ? '↑' : '↓') : ''}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {carregando ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
            ) : (
                <FlatList
                    data={jogos}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <Text style={styles.vazio}>Nenhum jogo encontrado.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12, backgroundColor: colors.background },
    topBar: { flexDirection: 'row', gap: 6, marginBottom: 10 },
    inputBusca: {
        flex: 1, backgroundColor: colors.surface, color: colors.text,
        borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 10, height: 42,
    },
    btnBuscar: {
        backgroundColor: colors.surfaceAlt, justifyContent: 'center',
        paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: colors.border,
    },
    btnNovo: {
        backgroundColor: colors.primary, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 6,
    },
    btnTexto: { color: '#fff', fontWeight: 'bold' },
    ordenacaoBar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    ordenarLabel: { color: colors.textMuted, fontSize: 12 },
    btnOrdem: {
        paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6,
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    },
    btnOrdemAtivo: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
    btnOrdemTexto: { color: colors.text, fontSize: 12, fontWeight: '600' },
    card: {
        flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 8,
        padding: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center',
    },
    capa: { width: 55, height: 75, borderRadius: 4, backgroundColor: colors.surfaceAlt },
    info: { flex: 1, marginLeft: 10 },
    titulo: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    genero: { color: colors.primaryLight, fontSize: 12, marginTop: 2 },
    preco: { color: colors.success, fontSize: 14, fontWeight: 'bold', marginTop: 4 },
    data: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
    acoes: { gap: 6 },
    btnAcao: {
        borderWidth: 1, borderRadius: 5, paddingVertical: 5, paddingHorizontal: 10, alignItems: 'center',
    },
    vazio: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});