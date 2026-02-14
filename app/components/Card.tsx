import styles from "./GameCard.module.css";

export interface CardProps {
  title: string;
  category: string;
  description: string;
  players: string;
  duration: string;
  interested?: boolean;
  onInterestToggle?: () => void;
  thumbnail?: string;
  copies?: number;
}

export default function Card({
  title,
  category,
  description,
  players,
  duration,
  thumbnail,
  copies,
}: CardProps) {
  return (
    <article className={styles.itemCard}>
      {thumbnail && (
        <div className={styles.itemThumbnailWrapper}>
          <img src={thumbnail} alt={title} className={styles.itemThumbnail} />
        </div>
      )}
      <div className={styles.itemContent}>
        <h3 className={styles.itemName}>{title}</h3>
        <p className={styles.itemType}>{category}</p>
        <p className={styles.itemDescription}>{description}</p>
        <div className={styles.itemFooter}>
          <span className={styles.itemMeta}>Duration: {duration}</span>
          <span className={styles.itemMeta}>Players: {players}</span>
          {typeof copies === "number" && <span className={styles.itemMeta}>Copies: {copies}</span>}
        </div>
      </div>
    </article>
  );
}

  export function GameCard(props: CardProps) {
    return <Card {...props} />;
  }
