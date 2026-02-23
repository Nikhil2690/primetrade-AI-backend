import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const createTask = AsyncHandler(async (req, res) => {
    const {title, description} = req.body

    if(!title) throw new ApiError(400, "Title is required")

    const task = Task.create({
        title,
        description,
        owner: req.user._id,
    })

    return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created Successfully"))
})

const getMyTasks = AsyncHandler(async (req, res) => {
    const userId = req.user._id

    const tasks = await Task.find({owner: userId}).sort("-createdAt")

    return res
    .status(200)
    .json(new ApiResponse(201, tasks, "Tasks fetched Successfully"))
})

const updateTask = AsyncHandler(async (req, res) => {
    const {taskId} = req.params
    const {title, description} = req.body;

    const task = await Task.findById(taskId)

    if(!task){
        throw new ApiError(404, "Task not found")
    }

    if(task.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You do not have permission to update this task")
    }

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                title,
                description
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated Succesfully"))
})

const deleteTask = AsyncHandler(async (req, res) => {
    const { id } = req.params; 
    const userId = req.user._id;

    const task = await Task.findById(id);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You do not have permission to delete this task");
    }

    await Task.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task deleted successfully"));
});


export {
    createTask,
    getMyTasks,
    updateTask,
    deleteTask
}