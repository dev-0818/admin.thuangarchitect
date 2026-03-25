"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  deleteProjectAction,
  reorderProjectsAction,
  toggleProjectPublishAction
} from "@/app/actions";
import { MaterialIcon } from "@/components/material-icon";
import { StatusBadge } from "@/components/status-badge";
import { Project, ProjectCategory } from "@/lib/types";
import { buildPublicProjectUrl, sentenceCaseCategory } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80";

type ProjectListBoardProps = {
  category: ProjectCategory;
  projects: Project[];
};

type SortableCardProps = {
  project: Project;
  onTogglePublish: (project: Project) => void;
  onDelete: (project: Project) => void;
  onOpenEditor: (project: Project) => void;
  openingProjectId: string | null;
  isPending: boolean;
};

function SortableCard({
  project,
  onTogglePublish,
  onDelete,
  onOpenEditor,
  openingProjectId,
  isPending
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      className="group flex flex-col gap-4 rounded-sm bg-surface-container p-4 transition hover:bg-surface-bright md:flex-row md:items-center md:justify-between"
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center gap-4 md:gap-6">
        <button
          className="cursor-grab text-outline transition hover:text-primary"
          type="button"
          {...attributes}
          {...listeners}
        >
          <MaterialIcon className="text-[20px]" name="drag_indicator" />
        </button>
        <div className="h-16 w-24 overflow-hidden rounded-sm bg-surface-container-lowest">
          <img
            alt={project.title}
            className="h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
            src={project.coverImageUrl ?? project.images[0]?.imageUrl ?? FALLBACK_IMAGE}
          />
        </div>
        <div>
          <h4 className="font-headline text-lg font-bold tracking-tight text-on-surface">
            {project.title}
          </h4>
          <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-outline">
            {buildPublicProjectUrl(project.category, project.slug)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 md:gap-8">
        <StatusBadge published={project.isPublished} />
        <button
          className="secondary-button px-4 py-2"
          disabled={isPending}
          onClick={() => onTogglePublish(project)}
          type="button"
        >
          <MaterialIcon
            className="text-[18px]"
            filled={project.isPublished}
            name={project.isPublished ? "visibility_off" : "visibility"}
          />
          {project.isPublished ? "Unpublish" : "Publish"}
        </button>
        <button
          className="secondary-button border-error/30 px-4 py-2 text-error hover:bg-error/10"
          disabled={isPending}
          onClick={() => onDelete(project)}
          type="button"
        >
          <MaterialIcon className="text-[18px]" name="delete" />
          Delete
        </button>
        <Link
          className="primary-button px-4 py-2"
          href={`/projects/${project.id}/edit`}
          onClick={() => onOpenEditor(project)}
        >
          <MaterialIcon
            className={openingProjectId === project.id ? "animate-spin text-[18px]" : "text-[18px]"}
            name={openingProjectId === project.id ? "progress_activity" : "edit"}
          />
          {openingProjectId === project.id ? "Opening..." : "Edit"}
        </Link>
      </div>
    </article>
  );
}

export function ProjectListBoard({ category, projects }: ProjectListBoardProps) {
  const [items, setItems] = useState(projects);
  const [message, setMessage] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [openingProjectId, setOpeningProjectId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  const ids = useMemo(() => items.map((project) => project.id), [items]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setItems((current) => {
      const oldIndex = current.findIndex((entry) => entry.id === active.id);
      const newIndex = current.findIndex((entry) => entry.id === over.id);

      return arrayMove(current, oldIndex, newIndex);
    });
  }

  return (
    <section className="mb-16">
      <div className="mb-6 flex flex-col gap-4 border-b border-outline-variant/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.36em] text-secondary">
            {category === "komersial" ? "Sector 01" : "Sector 02"}
          </p>
          <h3 className="mt-2 font-headline text-4xl font-black tracking-tight text-on-surface">
            {sentenceCaseCategory(category)}
          </h3>
        </div>

        <button
          className="secondary-button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              setPendingAction(`reorder:${category}`);
              const result = await reorderProjectsAction({
                category,
                ids: items.map((project) => project.id)
              });
              setMessage(result);
              setPendingAction("");
            });
          }}
          type="button"
        >
          <MaterialIcon className="text-[18px]" name="save" />
          Save Order
        </button>
      </div>

      {message ? <p className="mb-4 text-sm text-outline">{message}</p> : null}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((project) => (
              <SortableCard
                isPending={isPending}
                key={project.id}
                onOpenEditor={(entry) => setOpeningProjectId(entry.id)}
                onTogglePublish={(entry) => {
                  startTransition(async () => {
                    setPendingAction(`publish:${entry.id}`);
                    const result = await toggleProjectPublishAction(
                      entry.id,
                      !entry.isPublished
                    );
                    setItems((current) =>
                      current.map((item) =>
                        item.id === entry.id
                          ? { ...item, isPublished: !item.isPublished }
                          : item
                      )
                    );
                    setMessage(result);
                    setPendingAction("");
                  });
                }}
                onDelete={(entry) => {
                  setProjectToDelete(entry);
                }}
                openingProjectId={openingProjectId}
                project={project}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {projectToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-sm border border-outline-variant/20 bg-surface-container p-8 shadow-ambient">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-secondary">
              Confirm Delete
            </p>
            <h4 className="mt-3 font-headline text-3xl font-black tracking-tight text-on-surface">
              Hapus {projectToDelete.title}?
            </h4>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              Semua data project, gallery image di database, dan file image di storage akan
              dihapus permanen. Aksi ini tidak bisa dibatalkan.
            </p>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                className="secondary-button"
                disabled={isPending}
                onClick={() => {
                  if (!isPending) {
                    setProjectToDelete(null);
                  }
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="secondary-button border-error/30 px-5 py-3 text-error hover:bg-error/10"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    setPendingAction(`delete:${projectToDelete.id}`);
                    const result = await deleteProjectAction(projectToDelete.id);
                    setItems((current) =>
                      current.filter((item) => item.id !== projectToDelete.id)
                    );
                    setMessage(result);
                    setProjectToDelete(null);
                    setPendingAction("");
                  });
                }}
                type="button"
              >
                <MaterialIcon
                  className={pendingAction === `delete:${projectToDelete.id}` ? "animate-spin text-[18px]" : "text-[18px]"}
                  name={pendingAction === `delete:${projectToDelete.id}` ? "progress_activity" : "delete"}
                />
                {pendingAction === `delete:${projectToDelete.id}` ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
