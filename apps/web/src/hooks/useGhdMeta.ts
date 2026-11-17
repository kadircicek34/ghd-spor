import { useEffect } from 'react'

export const GHD_DEFAULT_TITLE = 'GHD Spor | Global Hukukçular Derneği'
export const GHD_DEFAULT_DESCRIPTION =
  'Global Hukukçular Derneği üyelerine özel antrenman, beslenme ve kardiyo platformu. Hukukçu kimliğinizle başvurun, e-Devlet belgenizle doğrulanın.'

/**
 * Título y descripción de las pantallas GHD. No usamos `useDocumentMeta`
 * porque añade el sufijo «Calistenia App» y negocia el idioma de marketing;
 * estas pantallas son siempre turcas.
 */
export function useGhdMeta(title: string = GHD_DEFAULT_TITLE, description: string = GHD_DEFAULT_DESCRIPTION) {
  useEffect(() => {
    const previousTitle = document.title
    const previousLang = document.documentElement.lang
    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = descriptionTag?.content

    document.title = title
    document.documentElement.lang = 'tr'
    if (descriptionTag) descriptionTag.content = description

    return () => {
      document.title = previousTitle
      document.documentElement.lang = previousLang
      if (descriptionTag && previousDescription !== undefined) descriptionTag.content = previousDescription
    }
  }, [title, description])
}
