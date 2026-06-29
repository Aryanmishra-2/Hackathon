import "./TimelineCard.css";

export default function TimelineCard({ activity }) {

  const formatDate = (date) => {

    return new Date(date).toLocaleString();

  };

  return (

    <div className="timeline-card">

      <div className="timeline-dot"></div>

      <div className="timeline-content">

        <div className="timeline-header">

          <h3>{activity.title}</h3>

          <span>

            {formatDate(activity.createdAt)}

          </span>

        </div>

        <p>

          {activity.description}

        </p>

      </div>

    </div>

  );

}