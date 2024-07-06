import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../util/http.js";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 10000,
  });

  /* 
 const {
    mutate,
    isPending: isPendingEdit,
    isError: isErrorEdit,
    error: errorEdit,
  } = useMutation({
    mutationFn: updateEvent,
    //helps in performing optimistic update
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["events", id] });
      const prevData = queryClient.getQueryData(["events", id]);
      queryClient.setQueryData(["events", id], data.event);

      return { prevData };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", id], context.prevData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", id]);
    },
  });
*/
  function handleSubmit(formData) {
    // mutate({ id, event: formData });
    // navigate("../");

    submit(formData, {
      method: "PUT",
    });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Error occured"
          message={error.info?.message || "Failed to load event"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting" ? (
          <p>Sending Data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  const { id } = params;
  return queryClient.fetchQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);

  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
