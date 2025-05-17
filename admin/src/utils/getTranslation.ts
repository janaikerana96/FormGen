import { PLUGIN_ID } from '../pluginId';

const getTranslation = (id: string) => `${PLUGIN_ID}.${id}`;

// Função auxiliar para obter o nome do plugin diretamente
const getPluginName = () => PLUGIN_ID;

export { getTranslation, getPluginName };
