export interface Card {
  id: string
  title: string
  description: string
  labels: string[]
  assignees: string[]
  comments: number
}

export interface Column {
  id: string
  title: string
  cards: Card[]
}
