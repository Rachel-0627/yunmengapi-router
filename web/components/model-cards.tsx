import { Section } from './section'
import { ModelTabs } from './model-tabs'

export function ModelCards() {
  return (
    <Section
      id="models"
      eyebrow="Models"
      title={
        <>
          主流模型,<span className="grad-text">最高省 90%</span>
        </>
      }
      desc="文本模型按 token 计费,生图模型按张计费。充多少用多少,没有月费,没有最低消费。"
    >
      <ModelTabs />
    </Section>
  )
}
