const BASE_URL = 'http://192.168.3.49:8080/api/jogos';

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (e) {
    throw { status: 0, data: { erro: 'Não foi possível conectar ao servidor.' } };
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // resposta sem JSON
  }

  if (!response.ok) {
    throw { status: response.status, data: data || { erro: 'Erro inesperado.' } };
  }

  return data;
}

export function listarJogos({ buscar = '', ordem = 'titulo', dir = 'asc' } = {}) {
  const params = new URLSearchParams({ ordem, dir });
  if (buscar.trim()) params.append('buscar', buscar.trim());
  return request(`${BASE_URL}?${params.toString()}`);
}

export function buscarJogo(id) {
  return request(`${BASE_URL}/${id}`);
}

export function criarJogo(jogo) {
  return request(BASE_URL, { method: 'POST', body: JSON.stringify(jogo) });
}

export function atualizarJogo(id, jogo) {
  return request(`${BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(jogo) });
}

export function excluirJogo(id) {
  return request(`${BASE_URL}/${id}`, { method: 'DELETE' });
}