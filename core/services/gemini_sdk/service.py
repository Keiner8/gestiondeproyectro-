from django.conf import settings


class GeminiSdkError(Exception):
    """Error controlado para la integracion con Gemini (SDK)."""


def generar_respuesta_gemini(texto, modelo=None):
    try:
        import google.generativeai as genai
    except Exception as exc:
        raise GeminiSdkError(f'No se pudo cargar google-generativeai: {exc}')

    api_key = (getattr(settings, 'GEMINI_API_KEY', '') or '').strip()
    if not api_key:
        raise GeminiSdkError('GEMINI_API_KEY no esta configurada en el servidor')

    genai.configure(api_key=api_key)

    model_name = (modelo or getattr(settings, 'GEMINI_MODEL', '') or 'gemini-1.5-flash').strip()
    if not model_name:
        model_name = 'gemini-1.5-flash'

    prompt = (texto or '').strip()
    if not prompt:
        raise GeminiSdkError('Debes escribir una pregunta en texto')

    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
    except Exception as exc:
        if model_name.startswith('gemini-2.5'):
            try:
                fallback_model = genai.GenerativeModel('gemini-1.5-flash')
                response = fallback_model.generate_content(prompt)
            except Exception as exc_fallback:
                raise GeminiSdkError(
                    'Gemini fallo con el modelo gemini-2.5. '
                    f'Error: {exc}. '
                    f'Reintento con gemini-1.5-flash fallo: {exc_fallback}'
                )
        else:
            raise GeminiSdkError(f'Gemini fallo al generar respuesta: {exc}')

    respuesta = getattr(response, 'text', '') or ''
    return respuesta.strip()




