class JobError(Exception):
    """A job failure whose message is meaningful to the user.

    Pipeline stages raise subclasses of this; the queue persists str(e) to
    Job.error. Anything else that escapes a handler is treated as a bug and
    persisted with an "Unexpected" prefix.
    """


class JobCancelled(Exception):  # noqa: N818 - control-flow signal, not an error
    """Raised inside a handler when the job's cancel event is set."""
