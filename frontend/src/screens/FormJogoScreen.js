import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { buscarJogo, criarJogo, atualizarJogo } from '../api/jogosApi';
import { colors } from '../theme';

export default function FormJogoScreen({ route, navigation }) {
  const jogoId = route.params?.jogoId ?? null;
  const isEdicao = jogoId !== null;

  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [preco, setPreco] = useState('');
  const [dataLancamento, setDataLancamento] = useState('');
  const [urlCapa, setUrlCapa] = useState('');
  const [descricao, setDescricao] = useState('');

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(isEdicao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEdicao ? 'Editar Jogo' : 'Novo Jogo',
    });

    if (isEdicao) {
      buscarJogo(jogoId)
        .then((jogo) => {
          setTitulo(jogo.titulo ?? '');
          setGenero(jogo.genero ?? '');
          setPreco(jogo.preco !== null && jogo.preco !== undefined ? String(jogo.preco) : '');
          setDataLancamento(jogo.dataLancamento ?? '');
          setUrlCapa(jogo.urlCapa ?? '');
          setDescricao(jogo.descricao ?? '');
        })
        .catch((err) => {
          Alert.alert('Erro', err.data?.erro || 'Não foi possível carregar o jogo.');
          navigation.goBack();
        })
        .finally(() => setCarregando(false));
    }
  }, [jogoId, isEdicao, navigation]);

  function formatarDataInput(texto) {
    const digitos = texto.replace(/\D/g, '').slice(0, 8);
    if (digitos.length <= 4) return digitos;
    if (digitos.length <= 6) return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
    return `${digitos.slice(0, 4)}-${digitos.slice(4, 6)}-${digitos.slice(6)}`;
  }

  async function handleSalvar() {
    setErros({});

    const precoNormalizado = preco.trim().replace(',', '.');
    const payload = {
      titulo: titulo.trim(),
      genero: genero.trim(),
      preco: precoNormalizado === '' ? null : Number(precoNormalizado),
      dataLancamento: dataLancamento.trim() === '' ? null : dataLancamento.trim(),
      urlCapa: urlCapa.trim() === '' ? null : urlCapa.trim(),
      descricao: descricao.trim() === '' ? null : descricao.trim(),
    };

    if (payload.preco !== null && Number.isNaN(payload.preco)) {
      setErros({ preco: 'Informe um valor numérico válido.' });
      return;
    }

    setSalvando(true);
    try {
      if (isEdicao) {
        await atualizarJogo(jogoId, payload);
      } else {
        await criarJogo(payload);
      }
      navigation.goBack();
    } catch (err) {
      if (err.status === 400 && err.data && !err.data.erro) {
        setErros(err.data);
      } else {
        Alert.alert('Erro ao salvar', err.data?.erro || 'Verifique os dados e tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={[styles.input, erros.titulo && styles.inputErro]}
          placeholder="Ex.: Cyberpunk 2077"
          placeholderTextColor={colors.textMuted}
          value={titulo}
          onChangeText={setTitulo}
        />
        {erros.titulo && <Text style={styles.textoErro}>{erros.titulo}</Text>}

        <Text style={styles.label}>Gênero *</Text>
        <TextInput
          style={[styles.input, erros.genero && styles.inputErro]}
          placeholder="Ex.: RPG, Ação, Aventura"
          placeholderTextColor={colors.textMuted}
          value={genero}
          onChangeText={setGenero}
        />
        {erros.genero && <Text style={styles.textoErro}>{erros.genero}</Text>}

        <Text style={styles.label}>Preço (R$) *</Text>
        <TextInput
          style={[styles.input, erros.preco && styles.inputErro]}
          placeholder="Ex.: 149.90 (0 para gratuito)"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={preco}
          onChangeText={setPreco}
        />
        {erros.preco && <Text style={styles.textoErro}>{erros.preco}</Text>}

        <Text style={styles.label}>Data de Lançamento (AAAA-MM-DD)</Text>
        <TextInput
          style={[styles.input, erros.dataLancamento && styles.inputErro]}
          placeholder="Ex.: 2020-12-10"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={10}
          value={dataLancamento}
          onChangeText={(txt) => setDataLancamento(formatarDataInput(txt))}
        />
        {erros.dataLancamento && <Text style={styles.textoErro}>{erros.dataLancamento}</Text>}

        <Text style={styles.label}>URL da Capa</Text>
        <TextInput
          style={[styles.input, erros.urlCapa && styles.inputErro]}
          placeholder="https://..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="url"
          value={urlCapa}
          onChangeText={setUrlCapa}
        />
        {erros.urlCapa && <Text style={styles.textoErro}>{erros.urlCapa}</Text>}

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea, erros.descricao && styles.inputErro]}
          placeholder="Sinopse ou detalhes sobre o jogo..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={descricao}
          onChangeText={setDescricao}
        />
        {erros.descricao && <Text style={styles.textoErro}>{erros.descricao}</Text>}

        <TouchableOpacity
          style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBotaoSalvar}>
              {isEdicao ? 'Salvar Alterações' : 'Cadastrar Jogo'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoCancelar}
          onPress={() => navigation.goBack()}
          disabled={salvando}
        >
          <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centralizado: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
  },
  inputErro: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 10,
  },
  textoErro: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  botaoSalvar: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotaoSalvar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  botaoCancelar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotaoCancelar: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});