import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http.js";
import Header from "../Header.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const [deleting, setIsDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: errorDelete,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function startDeleting() {
    setIsDeleting(true);
  }

  function stopDeleting() {
    setIsDeleting(false);
  }
  function handleDelete() {
    mutate({ id: params.id });
  }
  let content;
  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetchine Event data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Failed to load Event"
          message={error.info?.message || "Failed to fetch event."}
        />
      </div>
    );
  }

  if (data) {
    content = (
      <>
        {deleting && (
          <Modal onClose={stopDeleting}>
            <p>Are you Sure to Delete</p>
            {isPendingDeletion && <p>Deleting Please wait...</p>}
            {!isPendingDeletion && (
              <div className="form-actions">
                <button onClick={stopDeleting} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </div>
            )}
          </Modal>
        )}
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={startDeleting}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
