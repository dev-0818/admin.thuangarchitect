"use client";

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
  rectSortingStrategy,
  SortableContext,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import imageCompression from "browser-image-compression";
import { useEffect, useMemo, useState, useTransition } from "react";

import { saveProjectAction } from "@/app/actions";
import { MaterialIcon } from "@/components/material-icon";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Project, ProjectImage, ProjectCategory } from "@/lib/types";
import { cn, sentenceCaseCategory, slugify } from "@/lib/utils";

type ProjectEditorProps = {
  project: Project;
  mode: "create" | "edit";
  statusMessage?: string;
  errorMessage?: string;
};

type SortableImageCardProps = {
  image: ProjectImage;
  isCover: boolean;
  onDelete: (imageId: string) => void;
  onSetCover: (imageUrl: string) => void;
};

function SortableImageCard({
  image,
  isCover,
  onDelete,
  onSetCover
}: SortableImageCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: image.id
  });

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-sm bg-surface-container-high",
        isCover ? "ring-2 ring-secondary" : ""
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <img
        alt={image.altText ?? "Project image"}
        className="aspect-square h-full w-full object-cover"
        src={image.imageUrl}
      />
      <div className="absolute inset-0 flex flex-col justify-between bg-black/30 p-3 opacity-0 transition group-hover:opacity-100">
        <button className="self-start text-white" type="button" {...attributes} {...listeners}>
          <MaterialIcon className="text-[20px]" name="drag_indicator" />
        </button>

        <div className="flex items-center justify-between gap-2">
          <button
            className="secondary-button border-white/30 bg-white/10 px-3 py-2 text-[10px] text-white"
            onClick={() => onSetCover(image.imageUrl)}
            type="button"
          >
            <MaterialIcon className="text-[16px]" filled={isCover} name="star" />
            {isCover ? "Cover" : "Set Cover"}
          </button>
          <button
            className="secondary-button border-white/30 bg-white/10 px-3 py-2 text-[10px] text-white"
            onClick={() => onDelete(image.id)}
            type="button"
          >
            <MaterialIcon className="text-[16px]" name="delete" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectEditor({
  project,
  mode,
  statusMessage,
  errorMessage
}: ProjectEditorProps) {
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [category, setCategory] = useState<ProjectCategory>(project.category);
  const [description, setDescription] = useState(project.description);
  const [sortOrder, setSortOrder] = useState(project.sortOrder);
  const [isPublished, setIsPublished] = useState(project.isPublished);
  const [images, setImages] = useState<ProjectImage[]>(project.images);
  const [coverImageUrl, setCoverImageUrl] = useState<string>(project.coverImageUrl ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project.slug));
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, startUploadTransition] = useTransition();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [slugTouched, title]);

  useEffect(() => {
    if (!coverImageUrl && images[0]?.imageUrl) {
      setCoverImageUrl(images[0].imageUrl);
    }
  }, [coverImageUrl, images]);

  function handleGalleryDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setImages((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);

      return arrayMove(current, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index
      }));
    });
  }

  return (
    <form action={saveProjectAction} className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
      <input name="projectId" type="hidden" value={project.id} />
      <input name="imagesJson" type="hidden" value={JSON.stringify(images)} />
      <input name="coverImageUrl" type="hidden" value={coverImageUrl} />

      <div className="space-y-8">
        {statusMessage ? (
          <div className="rounded-sm border-l-4 border-secondary bg-surface-container-high p-5 text-sm text-on-surface">
            {statusMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-sm border-l-4 border-error bg-surface-container-high p-5 text-sm text-error">
            {errorMessage}
          </div>
        ) : null}

        <section className="section-card space-y-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-secondary">
              {mode === "create" ? "Create Project" : "Edit Project"}
            </p>
            <h2 className="mt-3 font-headline text-5xl font-black tracking-tight text-primary">
              {title || "Untitled Project"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant">
              Atur metadata project, publish state, dan struktur gallery sesuai alur portfolio
              publik.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
                Project Title
              </label>
              <input
                className="field-input text-2xl font-headline font-bold uppercase text-primary"
                name="title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </div>

            <div>
              <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
                URL Slug
              </label>
              <div className="flex items-center gap-2 text-sm text-outline">
                <span>/portfolio/{category}/</span>
                <input
                  className="field-input"
                  name="slug"
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  value={slug}
                />
              </div>
              {project.isPublished && slug !== project.slug ? (
                <p className="mt-3 text-sm text-error">
                  Mengubah slug project yang sudah publish akan mengubah URL publik.
                </p>
              ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
                  Category
                </label>
                <select
                  className="field-textarea h-12 py-0"
                  name="category"
                  onChange={(event) => setCategory(event.target.value as ProjectCategory)}
                  value={category}
                >
                  <option value="komersial">{sentenceCaseCategory("komersial")}</option>
                  <option value="residential">{sentenceCaseCategory("residential")}</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
                  Sort Order
                </label>
                <input
                  className="field-input"
                  min={0}
                  name="sortOrder"
                  onChange={(event) => setSortOrder(Number(event.target.value))}
                  type="number"
                  value={sortOrder}
                />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
                Project Description
              </label>
              <textarea
                className="field-textarea min-h-40"
                name="description"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </div>

            <label className="flex items-center justify-between rounded-sm bg-surface-container-high px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">Publish to Website</p>
                <p className="mt-1 text-xs text-outline">
                  Draft project tidak akan muncul di portfolio publik.
                </p>
              </div>
              <input
                checked={isPublished}
                name="isPublished"
                onChange={(event) => setIsPublished(event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="space-y-8">
        <section className="section-card space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-headline text-2xl font-bold tracking-tight text-primary">
                Gallery Management
              </h3>
              <p className="mt-2 text-sm text-outline">
                Upload, set cover image, dan urutkan gallery project.
              </p>
            </div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-outline">
              {images.length} Assets
            </span>
          </div>

          <label className="group block cursor-pointer rounded-sm border-2 border-dashed border-outline-variant/40 bg-surface-container-low p-8 text-center transition hover:border-secondary">
            <div className="mb-3 flex justify-center text-outline transition group-hover:text-secondary">
              <MaterialIcon className="text-[32px]" name="cloud_upload" />
            </div>
            <p className="font-headline text-lg font-bold text-on-surface">Upload Images</p>
            <p className="mt-2 text-sm text-outline">
              Otomatis compress ke WebP 1920px sebelum upload.
            </p>
            <input
              className="hidden"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);

                if (files.length === 0) {
                  return;
                }

                startUploadTransition(async () => {
                  const nextImages: ProjectImage[] = [];

                  for (const file of files) {
                    const compressed = await imageCompression(file, {
                      maxWidthOrHeight: 1920,
                      initialQuality: 0.85,
                      useWebWorker: true,
                      fileType: "image/webp"
                    });

                    const safeSlug = slug || slugify(title) || `project-${Date.now()}`;
                    const fileName = `${crypto.randomUUID()}.webp`;
                    const storagePath = `projects/${safeSlug}/${fileName}`;

                    let imageUrl = URL.createObjectURL(compressed);

                    if (supabase) {
                      const { error } = await supabase.storage
                        .from("portfolio-images")
                        .upload(storagePath, compressed, {
                          cacheControl: "3600",
                          contentType: "image/webp",
                          upsert: false
                        });

                      if (error) {
                        setUploadMessage(error.message);
                        continue;
                      }

                      imageUrl = supabase.storage.from("portfolio-images").getPublicUrl(storagePath)
                        .data.publicUrl;
                    } else {
                      setUploadMessage("Mode demo aktif. Isi env Supabase untuk upload sungguhan.");
                    }

                    nextImages.push({
                      id: crypto.randomUUID(),
                      imageUrl,
                      storagePath,
                      altText: `${safeSlug} image ${images.length + nextImages.length + 1}`,
                      sortOrder: images.length + nextImages.length
                    });
                  }

                  setImages((current) => {
                    const merged = [...current, ...nextImages].map((item, index) => ({
                      ...item,
                      sortOrder: index
                    }));

                    if (!coverImageUrl && merged[0]) {
                      setCoverImageUrl(merged[0].imageUrl);
                    }

                    return merged;
                  });
                });
              }}
              type="file"
            />
          </label>

          {uploadMessage ? <p className="text-sm text-outline">{uploadMessage}</p> : null}
          {isUploading ? <p className="text-sm text-secondary">Compressing and uploading...</p> : null}

          <DndContext collisionDetection={closestCenter} onDragEnd={handleGalleryDragEnd} sensors={sensors}>
            <SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {images.map((image) => (
                  <SortableImageCard
                    image={image}
                    isCover={coverImageUrl === image.imageUrl}
                    key={image.id}
                    onDelete={(imageId) => {
                      setImages((current) => {
                        const filtered = current
                          .filter((entry) => entry.id !== imageId)
                          .map((entry, index) => ({ ...entry, sortOrder: index }));

                        if (!filtered.some((entry) => entry.imageUrl === coverImageUrl)) {
                          setCoverImageUrl(filtered[0]?.imageUrl ?? "");
                        }

                        return filtered;
                      });
                    }}
                    onSetCover={(imageUrl) => setCoverImageUrl(imageUrl)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="rounded-sm bg-surface-container-high p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              Cover Image
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              {coverImageUrl ? "Cover image sudah dipilih dari gallery." : "Belum ada cover image."}
            </p>
          </div>

          <button className="primary-button w-full" type="submit">
            <MaterialIcon className="text-[18px]" name={mode === "create" ? "add" : "save"} />
            {mode === "create" ? "Create Project" : "Save Changes"}
          </button>
        </section>
      </aside>
    </form>
  );
}
