// utils/labels.ts
// Cargar etiquetas desde assets/Modelo/metadata.yaml (formato simple)

import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export async function loadLabelsFromYaml(): Promise<string[]> {
  try {
    const asset = Asset.fromModule(require('../assets/Modelo/metadata.yaml'));
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;
    const content = await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
    // Parseo mínimo: buscar una sección 'names:' y leer elementos con formato "- label"
    const lines = content.split(/\r?\n/);
    const labels: string[] = [];
    let inNames = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (!inNames) {
        if (/^names\s*:\s*$/.test(line)) {
          inNames = true;
        }
      } else {
        if (line.startsWith('- ')) {
          labels.push(line.substring(2).trim());
        } else if (line.length === 0 || /^[a-zA-Z0-9_]+\s*:\s*/.test(line)) {
          // fin de la sección o nueva clave
          break;
        }
      }
    }
    return labels;
  } catch (e) {
    console.warn('[labels] No se pudieron cargar etiquetas desde metadata.yaml:', (e as any)?.message || e);
    return [];
  }
}
