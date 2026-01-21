/* eslint-disable */
import * as React from 'react'
import { Editor } from 'amis-editor'
import { Select, uuid, Button } from 'amis'
import { currentLocale } from 'i18n-runtime'
import { Portal } from 'react-overlays'
import type {
  VariableItem,
  SchemaItem,
  VariableSchema,
  VariableItemSchema,
  LanguageOption,
  DefaultSchema,
  FormSchema,
  ToolListItem,
} from './types/global'
// import {Icon} from './icons/index';
import LayoutList from './layout/index'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/css/v4-shims.css'
import '../packages/amis/lib/themes/cxd.css'
import '../packages/amis/lib/helper.css'
import './css/iconfont.css'
import '../packages/amis-editor-core/lib/style.css'
import '../packages/amis-editor-core/scss/editor.scss'
import './_corpus-i18n.scss'
import './style.scss'

const i18nEnabled = false
const defaultSchema: DefaultSchema = {
  type: 'page',
  title: 'page',
  regions: ['body'],
  body: [],
}

const formSchema: FormSchema = {
  type: 'doc-entity',
  fields: [],
}
// #YueZhan: 表达式中的变量，只保留当前页面和全局变量
const schemas: any[] | undefined = []

const getVariables = (
  vars: VariableItem[],
): {
  variablesList: VariableItemSchema[]
  variableDefaultData: Record<string, any>
} => {
  const variableSchemas: VariableSchema = {
    type: 'object',
    $id: 'global',
    properties: {},
  }
  const variableDefaultData: Record<string, any> = {
    global: {},
  }
  vars.forEach(item => {
    const key = item.name
    variableSchemas.properties[key] = {
      type: item.value_type,
      title: item.name,
      default: item.value,
    }
    variableDefaultData.global[key] = item.value
  })
  const variablesList: VariableItemSchema[] = [
    {
      name: 'global',
      title: '全局变量',
      parentId: 'root',
      order: 1,
      schema: variableSchemas,
    },
  ]
  return {
    variablesList,
    variableDefaultData,
  }
}

const EditorType: { [key: string]: string } = {
  EDITOR: 'editor',
  MOBILE: 'mobile',
  FORM: 'form',
}

const editorLanguages: LanguageOption[] = [
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
]

const globalEvents: any[] = []

interface Props {
  isWujie: boolean
  theme: string
  canEdit?: boolean
  preview?: boolean
  appId?: string
  toolList?: ToolListItem[]
  variables?: VariableItem[]
  schemaList?: SchemaItem[]
  onSave?: (data: { schemaList: SchemaItem[] }) => void
}

interface State {
  canEdit: boolean
  preview: boolean
  type: string
  schema: any
  variables: any[]
  variableDefaultData: Record<string, any>
  curLanguage: string
  replaceText: Record<string, string>
  appLocale?: string
}

export default class AMisSchemaEditor extends React.Component<Props, State> {
  // #YueZhan
  // state: any = {
  //   canEdit: false,
  //   preview: false,
  //   type: EditorType.EDITOR,
  //   schema: defaultSchema,
  //   variables: [],
  //   variableDefaultData: {},
  //   curLanguage: currentLocale(), // 获取当前语料类型
  // }

  constructor(props: Props) {
    super(props)
    this.init(props)
  }

  init(_props: Props) {
    const wujieProps = window.$wujie?.props?.amisEditorProps || {}
    const componentProps = _props || {}
    const isWujie = window.$wujie?.props?.isWujie || _props.isWujie
    const props = isWujie ? wujieProps : componentProps
    const { schemaList = [], variables = [] } = props
    const state = {
      canEdit: false,
      preview: false,
      type: EditorType.EDITOR,
      schema: defaultSchema,
      variables: [] as any[],
      variableDefaultData: {},
      curLanguage: currentLocale(), // 获取当前语料类型
      replaceText: {},
    }
    const initSchemas = schemaList || []
    const searchParams = new URL(window.location.href).searchParams
    const preview = searchParams.get('preview')
    const pageValue = searchParams.get('page')

    if (!window.amisData) {
      window.amisData = {}
    }

    if (initSchemas && initSchemas.length > 0) {
      const pageOptions = initSchemas.map(item => ({
        label: item.title,
        value: item.id,
      }))
      const edittingSchema = pageValue
        ? initSchemas.find(item => item.id === pageValue)
        : initSchemas[0]
      window.amisData.schema_cache_list = initSchemas
      window.amisData.editting_schema = edittingSchema
      window.amisData.page_options = pageOptions
      state.schema = edittingSchema || (defaultSchema as any)
    }
    if (variables && variables.length > 0) {
      const { variablesList, variableDefaultData } = getVariables(variables)
      state.variables = variablesList as any[]
      state.variableDefaultData = variableDefaultData
    }
    const isPreview = !!preview || props.preview
    window.amisData.editting_preview = isPreview ? '1' : '0'
    state.preview = !!isPreview
    state.canEdit = !!props.canEdit
    if (i18nEnabled) {
      state.replaceText = {
        'i18n:1189fb5d-ac5b-4558-b363-068ce5decc99': uuid(),
      }
    }
    this.state = {
      ...state,
    }
  }

  getSchema(type: string): any {
    if (type === EditorType.FORM) {
      const schema = window.amisData?.editting_schema_form

      if (schema) {
        return schema
      }
      return formSchema
    }

    const lsSchema = window.amisData?.editting_schema

    if (lsSchema) {
      return lsSchema
    }

    return {}
  }

  handleChange = (value: any): void => {
    const type = this.state.type

    if (type === EditorType.FORM) {
      if (!window.amisData) {
        window.amisData = {}
      }
      window.amisData.editting_schema_form = value
    } else {
      if (!window.amisData) {
        window.amisData = {}
      }
      window.amisData.editting_schema = value
    }

    this.setState({
      schema: value,
    })

    // #YueZhan: 页面改动触发编辑器的change事件
    const data = window.amisData?.schema_cache_list
    if (!data) {
      if (!window.amisData) {
        window.amisData = {}
      }
      window.amisData.schema_cache_list = [value]
    }
    const pages = data ? data : [value]
    const currentIndex = pages.findIndex((item: any) => item.id === value.id)
    if (currentIndex < 0) return
    pages[currentIndex] = value
    if (!window.amisData) {
      window.amisData = {}
    }
    window.amisData.schema_cache_list = pages
  }

  changeLocale(value: string): void {
    localStorage.setItem('suda-i18n-locale', value)
    window.location.reload()
  }

  onSave = () => {
    const curSchema = this.state.schema
    if (!window.amisData) {
      window.amisData = {}
    }
    window.amisData.editting_schema = curSchema
  }

  savePages(): void {
    const data = window.amisData?.schema_cache_list
    if (!data) {
      return
    }
    const pages = data
    if (window.$wujie?.bus) {
      window.$wujie.bus.$emit('save-editor', { schemaList: pages })
    } else {
      this.props.onSave?.({ schemaList: pages })
    }
  }

  handlePreviewChange = (preview: boolean): void => {
    const url = new URL(window.location.href)
    if (!preview) {
      url.searchParams.delete('page')
      url.searchParams.delete('preview')
    } else {
      url.searchParams.set('preview', '1')
    }
    window.history.replaceState({}, document.title, url.toString())
    if (!window.amisData) {
      window.amisData = {}
    }
    window.amisData.editting_preview = preview ? '1' : '0'

    this.setState({
      preview: !!preview,
    })
  }

  togglePreview = () => {
    this.handlePreviewChange(!this.state.preview)
  }

  handleTypeChange = (editorType: string): void => {
    const type = editorType || EditorType.EDITOR
    if (!window.amisData) {
      window.amisData = {}
    }
    window.amisData.editting_preview_type = type

    this.setState({
      type: type,
      schema: this.getSchema(type),
    })
  }

  clearCache = () => {
    if (window.amisData) {
      delete window.amisData.editting_schema
    }
    this.setState({
      schema: defaultSchema,
    })
  }

  renderEditor() {
    const { theme } = this.props
    const { preview, type, schema, variables, variableDefaultData } = this.state
    const isMobile = type === EditorType.MOBILE
    // const { replaceText } = this.state
    const location = window.$wujie?.location || window.location

    return (
      <Editor
        preview={preview}
        isMobile={isMobile}
        value={schema}
        schemas={schemas}
        variables={variables}
        onChange={this.handleChange}
        onPreview={this.handlePreviewChange}
        onSave={this.onSave}
        className="is-fixed"
        i18nEnabled={i18nEnabled}
        theme={theme || 'cxd'}
        showCustomRenderersPanel={true}
        plugins={LayoutList} // 存放常见布局组件
        $schemaUrl={`${location.protocol}//${location.host}/schema.json`}
        actionOptions={{
          showOldEntry: false,
          globalEventGetter: () => globalEvents,
        }}
        ctx={{
          __page: {
            num: 2,
          },
          ...variableDefaultData,
        }}
      />
    )
  }

  render() {
    const { preview, canEdit, type, curLanguage } = this.state
    return (
      <div className="Editor-inner">
        {/* #YueZhan：这块是将预览以及端切换插入到了header中 */}
        <Portal container={() => document.querySelector('#headerBar') as any}>
          <>
            <div className="Editor-view-mode-group-container">
              {/* <div className="Editor-view-mode-group">
                <div
                  className={`Editor-view-mode-btn ${
                    type === EditorType.EDITOR ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    this.handleTypeChange(EditorType.EDITOR);
                  }}
                >
                  <Icon icon="pc-preview" title="PC模式" />
                </div>
                <div
                  className={`Editor-view-mode-btn ${
                    type === EditorType.MOBILE ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    this.handleTypeChange(EditorType.MOBILE);
                  }}
                >
                  <Icon icon="h5-preview" title="移动模式" />
                </div>
              </div> */}
            </div>

            <div className="Editor-header-actions">
              {/* <ShortcutKey /> */}
              {
                // @ts-ignore
                // vite编译时替换
                // __editor_i18n ? (
                //   <Select
                //     className="margin-left-space "
                //     options={editorLanguages}
                //     value={curLanguage}
                //     clearable={false}
                //     onChange={(e: any) => this.changeLocale(e.value)}
                //   />
                // ) : null
              }

              {i18nEnabled && (
                <Button
                  className="ml-2"
                  level="info"
                  onClick={() => {
                    let _uuid = uuid()
                    console.log('点击测试国际化按钮', _uuid)
                    this.setState({
                      appLocale: _uuid,
                      replaceText: {
                        'i18n:1189fb5d-ac5b-4558-b363-068ce5decc99': _uuid,
                      },
                    })
                  }}
                >
                  切换语料内容
                </Button>
              )}
              {canEdit && (
                <>
                  <div
                    className={`header-action-btn ${preview ? 'primary' : ''}`}
                    onClick={() => {
                      this.togglePreview()
                    }}
                  >
                    {preview ? '编辑' : '预览'}
                  </div>
                  <div
                    className={`header-action-btn primary`}
                    onClick={() => {
                      this.savePages()
                    }}
                  >
                    保存
                  </div>
                </>
              )}
            </div>
          </>
        </Portal>

        {this.renderEditor()}
      </div>
    )
  }
}
